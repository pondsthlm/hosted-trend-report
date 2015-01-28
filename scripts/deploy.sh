#!/bin/bash -e

if [[ "$1" = "production" ]]; then
  SERVERS="example.expressen.se"
else
  echo "Error: unknown env ($1)"
  echo "Usage:"
  echo "$0 <env>"
  exit 1
fi

APP_NAME="<EXAMLE APP>"
NODE_ENV="$1"
PORT=1234
DATE=$(date "+%Y-%m-%dT%H.%M.%S")
RELEASE_DIR="/home/web/$APP_NAME/releases/$DATE"
CUR_DIR="/home/web/$APP_NAME/current"
SHAREDMODULES_DIR="/home/web/$APP_NAME/shared/node_modules"
LOG_FILE="/home/web/log/$APP_NAME.log"

MKDIRS_CMD="mkdir -p $RELEASE_DIR"
SHAREDMODULES_CMD="mkdir -p $SHAREDMODULES_DIR && ln -s $SHAREDMODULES_DIR $RELEASE_DIR/node_modules"
NPM_CMD="cd $RELEASE_DIR && npm prune --production && npm install --production"
UPDATE_CUR_SYMLINK_CMD="ln -sfT $RELEASE_DIR $CUR_DIR"
STOP_CMD="cd $CUR_DIR && NODE_ENV=$NODE_ENV PORT=$PORT forever stop $CUR_DIR/cluster.js"
START_CMD="cd $CUR_DIR && NODE_ENV=$NODE_ENV PORT=$PORT forever start -l $LOG_FILE -a --workingDir $CUR_DIR $CUR_DIR/cluster.js"
CLEANUP_CMD="cd /home/web/$APP_NAME/releases && ls -tr | head -n -5 | xargs --no-run-if-empty rm -r"
CRONTAB_CONTENT="@reboot sleep 5 && $START_CMD"
CRONTAB_CMD="echo -e \"\$(crontab -l | grep -v $APP_NAME) \n$CRONTAB_CONTENT\" | crontab - "

echo "==> Building $1"
PACKAGE=$(npm pack | tail -1)

if [[ $? != 0 ]]; then
  echo "Error: could not build package"
  exit 2
fi

function sshAndLog {
  CMD_NAME=$1
  CMD=$2

  COLOR='\033[0;33m'
  RESET_COLOR='\033[0m'

  echo "==> $CMD_NAME" \
    && echo -e "$COLOR$CMD$RESET_COLOR" \
    && ssh web@$server "$CMD"
}

for server in $SERVERS; do
  echo "==> Deploying to $server" \
    && sshAndLog "Creating directories" "$MKDIRS_CMD && $SHAREDMODULES_CMD" \
    && echo "==> Upload package" \
    && cat "./$PACKAGE" | ssh web@$server "tar zx --strip-components 1 -C $RELEASE_DIR/." \
    && sshAndLog "Update npm" "$NPM_CMD" \
    && (sshAndLog "Stop service" "$STOP_CMD" || echo "process was not running") \
    && sshAndLog "Update symlink" "$UPDATE_CUR_SYMLINK_CMD" \
    && sshAndLog "Start service" "$START_CMD" \
    && sshAndLog "Update crontab" "$CRONTAB_CMD" \
    && sshAndLog "Cleanup" "$CLEANUP_CMD"
done

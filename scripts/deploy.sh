#!/bin/bash -e

ENVIRONMENT=$1
SERVERS_OVERRIDE=$2

# Replace with name for your service
# Also make sure to update config/pm2.json && pm2 save to match your service name/port
SERVICE_NAME="nodestarterapp"

RUNTESTS=0              # Control whether to run npm test before deploying.
FORCECOMMITS=0          # Control whether the script enforces all changes to be committed to the git repo.

if [[ "$ENVIRONMENT" = "epitest" ]]; then
  SERVERS="node-test-5.expressen.se"
elif [[ "$ENVIRONMENT" = "epistage" ]]; then
  SERVERS="node-test-6.expressen.se"
elif [[ "$ENVIRONMENT" = "livedata" ]]; then
  SERVERS="node-test-2.expressen.se node-test-3.expressen.se node-test-4.expressen.se"
elif [[ "$ENVIRONMENT" = "production" ]]; then
  # TODO Replace with the service's production servers
  SERVERS=""
  RUNTESTS=1
  FORCECOMMITS=1
  MASTERONLY=1
elif [[ "$ENVIRONMENT" = "nowhere" ]]; then
  # Used for testing this script, won't deploy anywhere.
  SERVERS=""
else
  echo "Error: unknown env ($ENVIRONMENT)"
  echo "Usage:"
  echo "$0 <env> [servers]"
  exit 1
fi

# Make it possible to deploy on a specific server
if [[ -n $SERVERS_OVERRIDE ]]; then
  SERVERS=$SERVERS_OVERRIDE
fi

NODE_ENV="$ENVIRONMENT"
REVISION_FILE="$(git rev-parse --show-toplevel)/config/_revision"
DATE=$(date "+%Y-%m-%dT%H.%M.%S")
RELEASE_DIR="/home/web/$SERVICE_NAME/releases/$DATE"
CUR_DIR="/home/web/$SERVICE_NAME/current"
SHAREDMODULES_DIR="/home/web/$SERVICE_NAME/shared/node_modules"

MKDIRS_CMD="mkdir -p $RELEASE_DIR"
SHAREDMODULES_CMD="mkdir -p $SHAREDMODULES_DIR && ln -s $SHAREDMODULES_DIR $RELEASE_DIR/node_modules"
NVM_CMD="cd $RELEASE_DIR && nvm install"
NPM_CMD="cd $RELEASE_DIR && nvm use && npm prune && npm install --production"
UPDATE_CUR_SYMLINK_CMD="ln -sfT $RELEASE_DIR $CUR_DIR"
START_CMD="cd $CUR_DIR && NODE_ENV=$NODE_ENV pm2 startOrRestart config/pm2.json && pm2 save"
CLEANUP_CMD="cd /home/web/$SERVICE_NAME/releases && ls -tr | head -n -5 | xargs --no-run-if-empty rm -r"
CRONTAB_CONTENT="@reboot sleep 5 && $START_CMD"
CRONTAB_CMD="echo -e \"\$(crontab -l | grep -v $SERVICE_NAME) \n$CRONTAB_CONTENT\" | crontab - "

# Ensure we are on master branch before deploying to a production environment.
BRANCH=`git rev-parse --abbrev-ref HEAD`
if [[ $MASTERONLY -eq 1 && "$BRANCH" != "master" && "$ENVIRONMENT" = "production" && "$DEPLOY_FROM_BRANCH" != "true" ]]; then
    echo "Error: You must be on master branch to deploy to production"
    echo "Set DEPLOY_FROM_BRANCH=true to override and deploy from branch \"$BRANCH\""
    exit 1
fi

# Make sure all changes are committed before deploying to a production environment.
if [[ $FORCECOMMITS -eq 1 ]]; then
  if [[ `git status --porcelain` ]]; then
    echo "Error: You have not committed your changes to git."
    exit 1
  fi
fi

# Run tests before deploying to a production environment.
if [[ $RUNTESTS -eq 1 ]]; then
  echo "==> Running tests"
  npm test
fi


echo "==> Building $ENVIRONMENT"
git rev-parse HEAD > "$REVISION_FILE"
PACKAGE=$(npm pack | tail -1)

if [[ $? != 0 ]]; then
  rm "$REVISION_FILE"
  echo "Error: could not build package"
  exit 1
fi
rm "$REVISION_FILE"

function sshAndLog {
  CMD_NAME=$1
  CMD=$2

  COLOR='\033[0;33m'
  RESET_COLOR='\033[0m'

  echo "==> $CMD_NAME"
  echo -e "$COLOR$CMD$RESET_COLOR"
  ssh web@$server "$CMD"
}

for server in $SERVERS; do
  echo "==> Deploying to $server"
  sshAndLog "Creating directories" "$MKDIRS_CMD && $SHAREDMODULES_CMD"
  echo "==> Upload package"
  cat "./$PACKAGE" | ssh web@$server "tar zx --strip-components 1 -C $RELEASE_DIR/."
  sshAndLog "Ensure node version via nvm" "$NVM_CMD"
  sshAndLog "Update npm" "$NPM_CMD"

  sshAndLog "Update symlink" "$UPDATE_CUR_SYMLINK_CMD"
  sshAndLog "Start service" "$START_CMD"
  sshAndLog "Update crontab" "$CRONTAB_CMD"
  sshAndLog "Cleanup" "$CLEANUP_CMD"
done

if [[ "$ENVIRONMENT" == "production" ]]; then
  echo "Updating 'deployed' tag in git."
  git tag -f deployed
  git push --force origin deployed
  echo "Don't forget to add a message to the #lanseringar channel in Slack about the release."
fi

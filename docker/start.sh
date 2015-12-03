#!/bin/bash -e
#
# Handle exp-docker container CMD's in a generic way.
#
# Uses PM2 by default as a process manager
# - Drop in execs in /exp-container/exec to make pm2 fork them on start (e.g varnish/consul-template)
echo "Starting exp-container for fun and profit."
if [ -d /exp-container/exec ]; then
  chown -R web:web /exp-container/data
  for x in $(find /exp-container/exec -type f); do
    xup=$(basename $x | awk '{print toupper($0)}')
    enabled=$(eval "echo \$${xup%.*}_ENABLED")
    user=$(eval "echo \$${xup%.*}_USER")
    if [ "${enabled}" = true ]; then
      echo "Starting $x..."
      if [ "$xup" = "PM2_WEB.SH" ]; then
        "${x}"
      else
        NODE_ENV=${NODE_ENV:-production} pm2 -u ${user:-root} start "${x}"
      fi
    fi
  done
  # This is our long living CMD
  if [ "${NODE_ENV}" = "development" ]; then
    exec pm2 logs --no-color
  else
    exec tail -f /root/.pm2/pm2.log
  fi
else
  echo "Nothing to run"
  exit 1
fi

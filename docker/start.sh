#!/bin/bash -e
#
# Handle exp-docker container CMD's in a generic way.
#
# Uses PM2 by default as a process manager
# - Drop in execs in /exp-container/exec to make pm2 fork them on start (e.g varnish/consul-template)
echo "Starting exp-container for fun and profit."
if [ -d /exp-container/exec ]; then
  for x in $(find /exp-container/exec -type f); do
    xup=$(basename $x | awk '{print toupper($0)}')
    enabled=$(eval "echo \$${xup%.*}_ENABLED")
    user=$(eval "echo \$${xup%.*}_USER")
    if [ "${enabled}" = true ]; then
      echo "Starting $x..."
      NODE_ENV=${NODE_ENV:-production} pm2 -u ${user:-root} start $x
    fi
  done
  # This is our long living CMD
  exec tail -f /root/.pm2/pm2.log
else
  echo "Nothing to run"
  exit 1
fi

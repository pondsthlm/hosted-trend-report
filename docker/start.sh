#!/bin/bash -e
#
# Handle exp-docker container CMD's in a generic way.
#
# Uses PM2 by default as a process manager
# - Drop in execs in /exp-container/exec to make pm2 fork them on start (e.g varnish/consul-template)
echo "Starting exp-container for fun and profit."
if [ -d /exp-container/exec ]; then
  chown -R web:web /home/web
  chown -R web:web /exp-container/data
  for x in $(find /exp-container/exec -type f); do
    xup=$(basename $x | awk '{print toupper($0)}')
    enabled=$(eval "echo \$${xup%.*}_ENABLED")
    if [ "${enabled}" = true ]; then
      echo "Starting $x..."
      if [ "$xup" = "PM2_WEB.SH" ]; then
        su -c "${x}" -s /bin/bash web
      else
        su -c "NODE_ENV=${NODE_ENV:-production} pm2 start ${x}" -s /bin/bash web
      fi
    fi
  done
  # This is our long living CMD
  if [ "${NODE_ENV}" = "development" ]; then
    exec su -c "pm2 logs" -s /bin/bash web
  else
    exec tail -f /home/web/.pm2/pm2.log
  fi
else
  echo "Nothing to run"
  exit 1
fi

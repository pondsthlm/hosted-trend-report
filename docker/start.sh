#!/bin/bash
#
# Handle exp-docker container CMD's in a generic way.
#
# Uses PM2 by default as a process manager
# - Drop in execs in /src/exec to make pm2 fork them on start (e.g varnish/consul-template)
echo "Starting exp-container for fun and profit."
if [ -d /exp-container/exec ]; then
  for x in $(find /exp-container/exec -perm /u=x,g=x,o=x -type f); do
  	echo "Starting $x..."
    NODE_ENV=${NODE_ENV:-production} pm2 start $x -x --interpreter bash
  done
fi
#
# Start your engines...
#
if [ -e /src/config/pm2-docker.json ]; then
	cd /src
	rm -f node_modules
	ln -s /node_modules .
    NODE_ENV=${NODE_ENV:-production} pm2 startOrRestart $(pwd)/config/pm2-docker.json
fi
# This is our long living CMD
pm2 logs --no-color
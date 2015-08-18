#!/bin/bash -e

VARNISH_CONF=${VARNISH_CONF:-/exp-container/config/varnish.vcl}
VARNISH_BACKEND_PORT=${VARNISH_BACKEND_PORT:-3000}
VARNISH_BACKEND_IP=${VARNISH_BACKEND_IP:-127.0.0.1}
VARNISH_PORT=${VARNISH_PORT:-80}

for name in VARNISH_BACKEND_PORT VARNISH_BACKEND_IP
do
    eval value=\$$name
    sed -i "s|\${${name}}|${value}|g" $VARNISH_CONF
done
varnishd -f ${VARNISH_CONF} -s malloc,250M -a 0.0.0.0:${VARNISH_PORT} -u web -F

#!/bin/sh
DELAY=45
logger -t redmatic -p daemon.info "Waiting $DELAY seconds before activating monit services"
sleep $DELAY
/usr/bin/monit -g redmatic monitor

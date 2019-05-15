#!/bin/sh

PID=$(pidof node-red)
STARTTIME=$(awk '{print int($22 / 100)}' /proc/$PID/stat)
UPTIME=$(awk '{print int($1)}' /proc/uptime)
NOW=$(date +%s)
DIFF=$((NOW - (UPTIME - STARTTIME)))
date +"%b %d, %H:%M" -d @$DIFF

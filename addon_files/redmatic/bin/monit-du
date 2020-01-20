#!/bin/sh

FOLDER_PATH=/usr/local/addons/redmatic

REFERENCE_SIZE=$1

#calculate size of folder
SIZE=$(/usr/bin/du -s $FOLDER_PATH | /usr/bin/awk '{print $1}')

#convert size to MB
MBSIZE=$((SIZE / 1024))

#output size so Monit can capture it
echo "$FOLDER_PATH disk $MBSIZE MB usage [$REFERENCE_SIZE MB allowed]"

#provide status code for alert
if [[ $MBSIZE -gt $(( $REFERENCE_SIZE )) ]]; then
    exit 1
fi
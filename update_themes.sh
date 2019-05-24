#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`
THEMES_DIR=$BUILD_DIR/addon_files/redmatic/lib/node-red-themes

echo "update theme bonanitech/midnight-red"
mkdir -p $THEMES_DIR/midnight-red
curl --silent --show-error -o $THEMES_DIR/midnight-red/midnight.css https://raw.githubusercontent.com/bonanitech/midnight-red/master/midnight.css
curl --silent --show-error -o $THEMES_DIR/midnight-red/theme-tomorrow.js https://github.com/bonanitech/midnight-red/blob/master/theme-tomorrow.js

git add $THEMES_DIR

#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

cd $BUILD_DIR/addon_files/redmatic/lib
$BUILD_DIR/node_modules/.bin/ncu -u

cd $BUILD_DIR/addon_files/redmatic/var
$BUILD_DIR/node_modules/.bin/ncu -u -x node-red-node-sqlite,node-red-node-serialport

cd $BUILD_DIR/addon_files/redmatic/www
$BUILD_DIR/node_modules/.bin/ncu -u

cd $BUILD_DIR
node update_package.js
node update_readme.js
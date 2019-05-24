#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

cd $BUILD_DIR/addon_files/redmatic/lib
$BUILD_DIR/node_modules/.bin/ncu -u

cd $BUILD_DIR/addon_files/redmatic/var
$BUILD_DIR/node_modules/.bin/ncu -u

cd $BUILD_DIR/addon_files/redmatic/www
$BUILD_DIR/node_modules/.bin/ncu -u

cd $BUILD_DIR
./update_themes.sh
node update_package.js
node update_nodejs.js
node update_readme.js

#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

cd $BUILD_DIR/addon_files/redmatic/lib
ncu -u

cd $BUILD_DIR/addon_files/redmatic/var
ncu -u

cd $BUILD_DIR/addon_files/redmatic/www
ncu -u

cd $BUILD_DIR
node combine_package.js

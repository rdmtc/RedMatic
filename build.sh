#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

mkdir $BUILD_DIR/dist 2> /dev/null

./build_addon.sh x86_64
./build_addon.sh armv7l
./build_addon.sh aarch64

./build_release_body.sh
./build_change_history.sh

cat RELEASE_BODY.md

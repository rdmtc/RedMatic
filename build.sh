#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

NODE_VERSION=${NODE_VERSION:-8.11.1}
ARCH=${ARCH:-armv6l}

NODE_NAME=node-v${NODE_VERSION}-linux-${ARCH}
NODE_URL=https://nodejs.org/dist/v${NODE_VERSION}/${NODE_NAME}.tar.xz

ADDON_FILES=$BUILD_DIR/addon_files
ADDON_TMP=$BUILD_DIR/addon_tmp

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*

echo "download and extract Node.js $NODE_URL ..."
curl --silent $NODE_URL | tar -xJf - -C $ADDON_TMP
mv $ADDON_TMP/$NODE_NAME $ADDON_TMP/node-red
rm $ADDON_TMP/node-red/README.md
rm $ADDON_TMP/node-red/CHANGELOG.md
mv $ADDON_TMP/node-red/LICENSE $ADDON_TMP/node-red/LICENSE_Nodejs

echo "copying files to tmp dir..."
cp -r $ADDON_FILES/* $ADDON_TMP/

cp package.json $ADDON_TMP/node-red/
cd $ADDON_TMP/node-red
echo "installing node modules..."
npm install --silent --no-package-lock --production --no-optional --global-style

echo "adapt Node-RED..."
rm -r $ADDON_TMP/node-red/node_modules/node-red/nodes/core/hardware
#mv $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js.orig
#sed "s/var npmCommand =.*/var npmCommand = '\/usr\/local\/addons\/node-red\/bin\/npm';/" $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js.orig > $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js

echo "moving node modules to lib dir..."
cp -r $ADDON_TMP/node-red/node_modules $ADDON_TMP/node-red/lib/
rm -r $ADDON_TMP/node-red/node_modules

cd $BUILD_DIR

echo "creating version file"
ADDON_VERSION=`jq -r '.version' $ADDON_TMP/node-red/package.json`
echo "export ADDON_VERSION=$ADDON_VERSION" > $ADDON_TMP/node-red/versions
echo "export NODE_VERSION=$NODE_VERSION" >> $ADDON_TMP/node-red/versions
echo "export NPM_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/npm/package.json`" >> $ADDON_TMP/node-red/versions
echo "export RED_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/node-red/package.json`" >> $ADDON_TMP/node-red/versions
echo "export DASHBOARD_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/node-red-dashboard/package.json`" >> $ADDON_TMP/node-red/versions
echo "export RED_CCU_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/node-red-contrib-ccu/package.json`" >> $ADDON_TMP/node-red/versions

cat $ADDON_TMP/node-red/versions

ADDON_FILE=ccu-addon-node-red-$ADDON_VERSION.tar.gz
echo "compressing addon package $ADDON_FILE ..."
mkdir $BUILD_DIR/dist 2> /dev/null
cd $ADDON_TMP
tar --exclude=.DS_Store -czf $BUILD_DIR/dist/$ADDON_FILE *
cd $BUILD_DIR

echo "done."
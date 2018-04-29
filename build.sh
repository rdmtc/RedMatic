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


echo "installing node modules..."
cp package.json $ADDON_TMP/node-red/
cd $ADDON_TMP/node-red
npm install --silent --no-package-lock --production --no-optional --global-style


echo "adapt Node-RED..."
rm -r $ADDON_TMP/node-red/node_modules/node-red/nodes/core/hardware
#mv $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js.orig
#sed "s/var npmCommand =.*/var npmCommand = '\/usr\/local\/addons\/node-red\/bin\/npm';/" $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js.orig > $ADDON_TMP/node-red/node_modules/node-red/red/runtime/nodes/registry/installer.js
mv $ADDON_TMP/node-red/node_modules/node-red/red/runtime/log.js $ADDON_TMP/node-red/node_modules/node-red/red/runtime/log.js.orig
sed "s/util\.log/console.log/g" $ADDON_TMP/node-red/node_modules/node-red/red/runtime/log.js.orig > $ADDON_TMP/node-red/node_modules/node-red/red/runtime/log.js


echo "moving node modules to lib dir..."
cp -r $ADDON_TMP/node-red/node_modules $ADDON_TMP/node-red/lib/
rm -r $ADDON_TMP/node-red/node_modules

cd $BUILD_DIR


echo "creating version file"
ADDON_VERSION=`jq -r '.version' $ADDON_TMP/node-red/package.json`
NPM_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/npm/package.json`
RED_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/node-red/package.json`
DASHBOARD_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/node-red-dashboard/package.json`
RED_CCU_VERSION=`jq -r '.version' $ADDON_TMP/node-red/lib/node_modules/node-red-contrib-ccu/package.json`

cat >$ADDON_TMP/node-red/versions <<EOL
export ADDON_VERSION=$ADDON_VERSION
export NODE_VERSION=$NODE_VERSION
export NPM_VERSION=$NPM_VERSION
export RED_VERSION=$RED_VERSION
export DASHBOARD_VERSION=$DASHBOARD_VERSION
export RED_CCU_VERSION=$RED_CCU_VERSION
EOL


echo "creating changelog file"
cat >CHANGELOG.md <<EOL
### Module Versions

* Node.js $NODE_VERSION
* npm $NPM_VERSION
* Node-RED $RED_VERSION
* Node-RED Dashboard $DASHBOARD_VERSION
* node-red-contrib-ccu $RED_CCU_VERSION


### Changelog

EOL

git log `git describe --tags --abbrev=0`..HEAD --pretty=format:'* %h @%an %s' >> CHANGELOG.md


echo "compressing addon package $ADDON_FILE ..."
ADDON_FILE=ccu-addon-node-red-$ADDON_VERSION.tar.gz
mkdir $BUILD_DIR/dist 2> /dev/null
cd $ADDON_TMP
tar --exclude=.DS_Store -czf $BUILD_DIR/dist/$ADDON_FILE *
cd $BUILD_DIR


echo "done."

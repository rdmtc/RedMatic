#!/bin/bash

ARCH=${1:-armv7l}

BUILD_DIR=`cd ${0%/*} && pwd -P`

VERSION_ADDON=`jq -r '.version' package.json`
NODE_VERSION=`jq -r '.engines.node' package.json`

echo ""
echo "Build RedMatic v$VERSION_ADDON ($ARCH)"
echo ""

case $ARCH in
  x86_64)
    NODE_NAME=node-v${NODE_VERSION}-linux-x64
    ;;
  i686)
    NODE_NAME=node-v${NODE_VERSION}-linux-x86
    ;;
  *)
    NODE_NAME=node-v${NODE_VERSION}-linux-${ARCH}
    ;;
esac

case $ARCH in
  armv6l)
    NODE_URL=https://unofficial-builds.nodejs.org/download/release/v${NODE_VERSION}/${NODE_NAME}.tar.xz
    PREBUILT=$BUILD_DIR/prebuilt/$ARCH
    ;;
  i686)
    # Todo - Node 14 i686 (32bit) build https://github.com/rdmtc/RedMatic/issues/374
    NODE_URL=https://unofficial-builds.nodejs.org/download/release/v${NODE_VERSION}/${NODE_NAME}.tar.xz
    PREBUILT=$BUILD_DIR/prebuilt/$ARCH
    ;;
  x86_64)
    NODE_URL=https://nodejs.org/dist/v${NODE_VERSION}/${NODE_NAME}.tar.xz
    PREBUILT=$BUILD_DIR/prebuilt/$ARCH
    ;;
  *)
    NODE_URL=https://nodejs.org/dist/v${NODE_VERSION}/${NODE_NAME}.tar.xz
    PREBUILT=$BUILD_DIR/prebuilt/armv6l
    ;;
esac



ADDON_FILES=$BUILD_DIR/addon_files
ADDON_TMP=$BUILD_DIR/addon_tmp
VERSION_FILE=$ADDON_TMP/redmatic/versions

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*

echo "download and extract Node.js $NODE_URL ..."
curl --silent $NODE_URL | tar -xJf - -C $ADDON_TMP || exit 1
mv $ADDON_TMP/$NODE_NAME $ADDON_TMP/redmatic
rm $ADDON_TMP/redmatic/README.md
rm $ADDON_TMP/redmatic/CHANGELOG.md
mv $ADDON_TMP/redmatic/LICENSE $BUILD_DIR/licenses/nodejs

echo "copying files to tmp dir..."
cp -r $ADDON_FILES/* $ADDON_TMP/

echo "copying assets to tmp dir..."
cp $BUILD_DIR/assets/redmatic5* $ADDON_TMP/redmatic/www/
cp $BUILD_DIR/assets/favicon/apple-icon-180x180.png $ADDON_TMP/redmatic/www/
cp $BUILD_DIR/assets/favicon/favicon-96x96.png $ADDON_TMP/redmatic/www/

echo "installing node modules..."
if [ "$ARCH" == "i686" ] || [ "$ARCH" == "x86_64" ]; then
    echo "removing Raspberry Pi specific modules..."
    mv $ADDON_TMP/redmatic/lib/package.json $ADDON_TMP/redmatic/lib/package.json.tmp
    cat $ADDON_TMP/redmatic/lib/package.json.tmp | jq 'del(.dependencies."node-red-contrib-johnny-five",.dependencies."node-red-contrib-rcswitch2")' >  $ADDON_TMP/redmatic/lib/package.json
    rm $ADDON_TMP/redmatic/lib/package.json.tmp
fi

cd $ADDON_TMP/redmatic/lib
npm install --no-package-lock --production --no-optional --global-style
npm install --no-package-lock --production --global-style ain2

if [ "$ARCH" == "x86_64" ]; then
  cd $ADDON_TMP/redmatic/lib/node_modules/ain2
  npm install --no-package-lock --production unix-dgram
fi

rm $ADDON_TMP/redmatic/lib/package.json

echo "installing additional Node-RED nodes..."
cd $ADDON_TMP/redmatic/var
npm install --silent --no-package-lock --production --no-optional --global-style

echo "installing www node modules"
cd $ADDON_TMP/redmatic/www
npm install --silent --no-package-lock --production --no-optional

cd $BUILD_DIR

echo "creating version file"
RED_VERSION=`jq -r '.version' $ADDON_TMP/redmatic/lib/node_modules/node-red/package.json`

cat > $VERSION_FILE <<EOL
export NODE_VERSION=$NODE_VERSION
export VERSION_ADDON=$VERSION_ADDON
export RED_VERSION=$RED_VERSION
EOL

echo "copying prebuilt binaries for $ARCH to tmp dir..."
cp -r $PREBUILT/* $ADDON_TMP/redmatic/
cd $ADDON_TMP
ln -s redmatic/bin/update_addon ./

echo "bundling packages..."
node $BUILD_DIR/build_packages.js $ARCH

echo "adapt Node-RED..."
INSTALLER=$ADDON_TMP/redmatic/lib/node_modules/node-red/node_modules/@node-red/registry/lib/installer.js
sed "s/var args = \['install'/var args = ['install','--no-package-lock','--global-style'/" $INSTALLER > $INSTALLER.tmp && mv $INSTALLER.tmp $INSTALLER
sed "s/var args = \['remove'/var args = ['remove','--no-package-lock'/" $INSTALLER > $INSTALLER.tmp && mv $INSTALLER.tmp $INSTALLER

cd $BUILD_DIR

if [ "$ARCH" == "armv7l" ]; then
    ADDON_FILE=redmatic-$VERSION_ADDON.tar.gz
else
    ADDON_FILE=redmatic-$ARCH-$VERSION_ADDON.tar.gz
fi

echo "compressing addon package $ADDON_FILE ..."

cd $ADDON_TMP
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ -f /usr/local/bin/gtar ]]; then
        gtar --exclude=.DS_Store --owner=root --group=root -czf $BUILD_DIR/dist/$ADDON_FILE *
    else
        tar --exclude=.DS_Store -czf $BUILD_DIR/dist/$ADDON_FILE *
    fi
else
    tar --owner=root --group=root -czf $BUILD_DIR/dist/$ADDON_FILE *
fi

cd $BUILD_DIR

sha256sum $BUILD_DIR/dist/$ADDON_FILE > $BUILD_DIR/dist/$ADDON_FILE.sha256

echo "done."

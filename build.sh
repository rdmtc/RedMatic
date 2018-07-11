#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

NODE_VERSION=`jq -r '.engines.node' package.json `
ARCH=${ARCH:-armv6l}

NODE_NAME=node-v${NODE_VERSION}-linux-${ARCH}
NODE_URL=https://nodejs.org/dist/v${NODE_VERSION}/${NODE_NAME}.tar.xz

ADDON_FILES=$BUILD_DIR/addon_files
ADDON_TMP=$BUILD_DIR/addon_tmp

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*


echo "download and extract Node.js $NODE_URL ..."
curl --silent $NODE_URL | tar -xJf - -C $ADDON_TMP
mv $ADDON_TMP/$NODE_NAME $ADDON_TMP/redmatic
rm $ADDON_TMP/redmatic/README.md
rm $ADDON_TMP/redmatic/CHANGELOG.md
rm $ADDON_TMP/redmatic/LICENSE


echo "copying files to tmp dir..."
cp -r $ADDON_FILES/* $ADDON_TMP/
cp $BUILD_DIR/assets/logo-x-120.png $ADDON_TMP/redmatic/www/


echo "installing node modules..."
cd $ADDON_TMP/redmatic/lib
npm install --silent --no-package-lock --production --no-optional --global-style
rm $ADDON_TMP/redmatic/lib/package.json


echo "installing additional Node-RED nodes..."
cd $ADDON_TMP/redmatic/var
npm install --silent --no-package-lock --production --no-optional --global-style

echo "installing www node modules"
cd $ADDON_TMP/redmatic/www
npm install --silent --no-package-lock --production --no-optional

echo "adapt Node-RED..."
rm -r $ADDON_TMP/redmatic/lib/node_modules/node-red/nodes/core/hardware
#mv $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/nodes/registry/installer.js $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/nodes/registry/installer.js.orig
#sed "s/var npmCommand =.*/var npmCommand = '\/usr\/local\/addons\/node-red\/bin\/npm';/" $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/nodes/registry/installer.js.orig > $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/nodes/registry/installer.js
mv $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/log.js $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/log.js.orig
sed "s/util\.log/console.log/g" $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/log.js.orig > $ADDON_TMP/redmatic/lib/node_modules/node-red/red/runtime/log.js


cd $BUILD_DIR


echo "creating version files"
MODULES_DIR=$ADDON_TMP/redmatic/lib/node_modules
VERSION_FILE=$ADDON_TMP/redmatic/versions
VERSION_ADDON=`jq -r '.version' package.json`
RED_VERSION=`jq -r '.version' $ADDON_TMP/redmatic/lib/node_modules/node-red/package.json`

cat > $VERSION_FILE <<EOL
export NODE_VERSION=$NODE_VERSION
export VERSION_ADDON=$VERSION_ADDON
EOL

echo "creating changelog file"
cat >CHANGELOG.md <<EOL
![](https://img.shields.io/github/downloads/hobbyquaker/RedMatic/v$VERSION_ADDON/total.svg)

### Changelog

EOL

git log `git describe --tags --abbrev=0`..HEAD --pretty=format:'* %h @%an %s' >> CHANGELOG.md

cat >>CHANGELOG.md <<EOL



Module | Version
------ | -------
[Node.js](https://nodejs.org/de/) | $NODE_VERSION
EOL

links() {
    case $1 in
        'npm')
            URL=https://github.com/npm/npm/releases
            ;;
        'node-red')
            URL=https://nodered.org/
            ;;
        'node-red-dashboard')
            URL=https://github.com/node-red/node-red-dashboard/releases
            ;;
        'node-red-contrib-ccu')
            URL=https://flows.nodered.org/node/node-red-contrib-ccu
            ;;
        'node-red-contrib-combine')
            URL=https://flows.nodered.org/node/node-red-contrib-combine
            ;;
        'node-red-contrib-mqtt-json')
            URL=https://flows.nodered.org/node/node-red-contrib-mqtt-json
            ;;
        'node-red-contrib-time-range-switch')
            URL=https://flows.nodered.org/node/node-red-contrib-time-range-switch
            ;;
        *)
            URL=
    esac

    echo "export VERSION_`echo $1 | sed -e 's/-//g'`=$2" >> $VERSION_FILE

    if [ $URL ]; then
        echo "[$1]($URL) | $2" >> CHANGELOG.md
    else
        echo "$1 | $2" >> CHANGELOG.md
    fi
}

for DIR in $(find $MODULES_DIR/ -maxdepth 1 -type d -not -name "node_modules" -not -name ".bin"  -exec basename {} \; | sort -t '\0' -n)
do
    VERSION=$(jq -r '.version' $MODULES_DIR/$DIR/package.json)
    links $DIR $VERSION
done

for DIR in $(find $ADDON_TMP/redmatic/var/node_modules/ -maxdepth 1 -type d -not -name "node_modules" -not -name ".bin"  -exec basename {} \; | sort -t '\0' -n)
do
    VERSION=$(jq -r '.version' $ADDON_TMP/redmatic/var/node_modules/$DIR/package.json)
    links $DIR $VERSION
done

echo -e "\n\n[Travis Build #$TRAVIS_BUILD_NUMBER](https://travis-ci.org/hobbyquaker/RedMatic/builds/$TRAVIS_BUILD_ID)" >> CHANGELOG.md


echo "compressing addon package $ADDON_FILE ..."
ADDON_FILE=redmatic-$VERSION_ADDON.tar.gz
mkdir $BUILD_DIR/dist 2> /dev/null
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


echo "done."

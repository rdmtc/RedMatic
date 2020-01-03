#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

NODE_VERSION=`jq -r '.engines.node' package.json `
ARCH=${ARCH:-armv6l}

NODE_NAME=node-v${NODE_VERSION}-linux-${ARCH}
NODE_URL=https://nodejs.org/dist/v${NODE_VERSION}/${NODE_NAME}.tar.xz

ADDON_FILES=$BUILD_DIR/addon_files
PREBUILT=$BUILD_DIR/prebuilt/$ARCH
ADDON_TMP=$BUILD_DIR/addon_tmp

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*
mkdir $BUILD_DIR/dist 2> /dev/null

#echo "download and install node-prune"
#curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash
#PRUNE=$BUILD_DIR/bin/node-prune

echo "installing build dependencies..."
npm install --only=dev

echo "generate CHANGE_HISTORY.md..."
node update_change_history.js
git commit -m 'Update change_history' CHANGE_HISTORY.md
git push

echo "download and extract Node.js $NODE_URL ..."
curl --silent $NODE_URL | tar -xJf - -C $ADDON_TMP
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
cd $ADDON_TMP/redmatic/lib
npm install --silent --no-package-lock --production --no-optional --global-style
npm install --slient --no-package-lock --production --global-style ain2
rm $ADDON_TMP/redmatic/lib/package.json

echo "installing additional Node-RED nodes..."
cd $ADDON_TMP/redmatic/var
npm install --silent --no-package-lock --production --no-optional --global-style

echo "installing www node modules"
cd $ADDON_TMP/redmatic/www
npm install --silent --no-package-lock --production --no-optional

cd $BUILD_DIR
if [ "$1" == "--licenses" ]; then
    echo "compiling 3rd party licenses"
    node update_licenses.js
    exit 0
fi

#echo "cleanup node_modules..."
#rm -r $ADDON_TMP/redmatic/lib/node_modules/node-red-node-sqlite/node_modules/sqlite3/lib/binding
#rm -r $ADDON_TMP/redmatic/lib/node_modules/node-red-node-sqlite/node_modules/sqlite3/deps
#$PRUNE $ADDON_TMP/redmatic/lib/node_modules
#$PRUNE $ADDON_TMP/redmatic/var/node_modules

echo "copying prebuilt binaries to tmp dir..."
cp -r $PREBUILT/* $ADDON_TMP/redmatic/
cd $ADDON_TMP
ln -s redmatic/bin/update_addon ./

echo "bundling packages..."
node $BUILD_DIR/bundle-pkgs.js

echo "adapt Node-RED..."
INSTALLER=$ADDON_TMP/redmatic/lib/node_modules/node-red/node_modules/@node-red/registry/lib/installer.js
sed "s/var args = \['install'/var args = ['install','--no-package-lock','--global-style'/" $INSTALLER > $INSTALLER.tmp && mv $INSTALLER.tmp $INSTALLER
sed "s/var args = \['remove'/var args = ['remove','--no-package-lock'/" $INSTALLER > $INSTALLER.tmp && mv $INSTALLER.tmp $INSTALLER

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
[![GitHub Releases (by Asset)](https://img.shields.io/github/downloads/rdmtc/RedMatic/v$VERSION_ADDON/redmatic-$VERSION_ADDON.tar.gz.svg)](https://github.com/rdmtc/RedMatic/releases/download/v$VERSION_ADDON/redmatic-$VERSION_ADDON.tar.gz)

### Changelog

EOL

git log `git describe --tags --abbrev=0`..HEAD --pretty=format:'* %h @%an %s' >> CHANGELOG.md

cat >>CHANGELOG.md <<EOL

[Release History](https://github.com/rdmtc/RedMatic/blob/master/CHANGE_HISTORY.md)

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

    echo "export VERSION_`echo $1 | sed -e 's/-//g'`=\"$2\"" >> $VERSION_FILE

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

echo -e "\n\n[Travis Build #$TRAVIS_BUILD_NUMBER](https://travis-ci.org/rdmtc/RedMatic/builds/$TRAVIS_BUILD_ID)" >> CHANGELOG.md

echo "compressing addon package $ADDON_FILE ..."
ADDON_FILE=redmatic-$VERSION_ADDON.tar.gz

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

cat CHANGELOG.md
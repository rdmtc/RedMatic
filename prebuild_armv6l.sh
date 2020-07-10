#!/bin/bash

DEST="prebuilt/armv6l"
REMOTE="root@pi-black"
REMOTE_PATH="/root/redmatic-prebuild"

cat addon_files/redmatic/lib/package.json | jq 'del(.dependencies.npm,.dependencies."node-red",.dependencies."@node-red-contrib-themes/midnight-red")' > $DEST/package.json

scp $DEST/package.json $REMOTE:$REMOTE_PATH

rm -r ${DEST}/lib/node_modules

ssh -t $REMOTE "cd $REMOTE_PATH ; npm install --global-style --unsafe-perm --no-package-lock"
ssh -t $REMOTE "cd $REMOTE_PATH/node_modules/node-red-node-sqlite ; npm install --unsafe-perm --build-from-source --no-package-lock sqlite3"

./prebuild_armv6l_copy.sh

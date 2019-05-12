#!/bin/bash

DEST="prebuilt/armv6l"
REMOTE="root@pi-black"
REMOTE_PATH="/root/redmatic-prebuild"

cat addon_files/redmatic/lib/package.json | jq 'del(.dependencies.npm,.dependencies."node-red")' > $DEST/package.json

scp $DEST/package.json $REMOTE:$REMOTE_PATH

ssh -t $REMOTE "cd $REMOTE_PATH ; npm install --global-style --unsafe-perm"
ssh -t $REMOTE "cd $REMOTE_PATH/node_modules/node-red-contrib-johnny-five ; npm install --save --unsafe-perm --global-style --production raspi-io"

rm -r ${DEST}/lib/node_modules

scp $REMOTE:/usr/bin/pig2vcd $DEST/bin/
scp $REMOTE:/usr/bin/pigpiod $DEST/bin/
scp $REMOTE:/usr/bin/pigs $DEST/bin/
scp $REMOTE:/usr/lib/libpigpiod_if2.so $DEST/lib/
scp $REMOTE:/usr/lib/libpigpiod_if.so $DEST/lib/
scp $REMOTE:/usr/lib/libpigpio.so $DEST/lib/

files=`ssh -t $REMOTE "cd $REMOTE_PATH ; find ./ -type f -name \*.node |grep -v obj.target"`

while read -r binary; do
    from=`echo ${REMOTE}:${REMOTE_PATH}/${binary} | tr -d '\r'`
    dest=`echo ${DEST}/lib/${binary%/*} | tr -d '\r'`
    mkdir -p ${dest}
    scp -q ${from} ${dest} && echo "${binary}"
done <<< "$files"

scp -r $REMOTE:$REMOTE_PATH/node_modules/node-red-contrib-johnny-five/node_modules $DEST/lib/node_modules/node-red-contrib-johnny-five

cp -R $DEST/lib/node_modules/node-red-contrib-zigbee/node_modules/cc-znp/node_modules/@serialport $DEST/lib/node_modules/node-red-contrib-zigbee/node_modules/

git add $DEST/lib

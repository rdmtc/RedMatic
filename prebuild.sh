#!/bin/bash

DEST="prebuilt/armv6l"
REMOTE="root@pi-black"
REMOTE_PATH="/root/redmatic-prebuild"

cat addon_files/redmatic/lib/package.json | jq 'del(.dependencies.npm,.dependencies."node-red")' > $DEST/package.json

scp $DEST/package.json $REMOTE:$REMOTE_PATH

ssh -t $REMOTE "cd $REMOTE_PATH ; npm install --global-style --unsafe-perm"
ssh -t $REMOTE "cd $REMOTE_PATH/node_modules/node-red-contrib-gpio ; npm install --save --unsafe-perm raspi-io"

rm -r ${DEST}/lib/node_modules

scp $REMOTE:/usr/bin/pig2vcd $DEST/bin/
scp $REMOTE:/usr/bin/pigpiod $DEST/bin/
scp $REMOTE:/usr/bin/pigs $DEST/bin/

files=`ssh -t $REMOTE "cd $REMOTE_PATH ; find ./ -type f -name \*.node |grep -v obj.target"`

while read -r binary; do
    from=`echo ${REMOTE}:${REMOTE_PATH}/${binary} | tr -d '\r'`
    dest=`echo ${DEST}/lib/${binary%/*} | tr -d '\r'`
    mkdir -p ${dest}
    scp -q ${from} ${dest} && echo "${binary}"
done <<< "$files"

git add $DEST/lib
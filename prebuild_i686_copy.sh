#!/bin/bash

DEST="prebuilt/i686"
REMOTE="root@debian-32"
REMOTE_PATH="/root/redmatic-prebuild"


files=`ssh -t $REMOTE "cd $REMOTE_PATH ; find ./ -type f -name \*.node |grep -v obj.target"`

while read -r binary; do
    echo $binary
    from=`echo ${REMOTE}:${REMOTE_PATH}/${binary} | tr -d '\r'`
    dest=`echo ${DEST}/lib/${binary%/*} | tr -d '\r'`
    mkdir -p ${dest}
    scp -q ${from} ${dest} && echo "${binary}"
done <<< "$files"

git add $DEST/lib

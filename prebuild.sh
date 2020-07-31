#!/bin/bash

ARCH=${1:-armv7l}

DEST="prebuilt/$ARCH"

case "$ARCH" in
  i686)
    REMOTE=redmatic@debian-32
    REMOTE_PATH="/home/redmatic/redmatic-prebuild"
    ;;
  armv6l)
    REMOTE=redmatic@pi-black
    REMOTE_PATH="/home/redmatic/redmatic-prebuild"
    ;;
  armv7l)
    REMOTE=redmatic@pi-metal
    REMOTE_PATH="/home/redmatic/redmatic-prebuild"
    ;;
esac

if [ $ARCH == "i686" ]; then
  JQ_CMD='del(.dependencies."node-red-contrib-johnny-five",.dependencies.npm,.dependencies."node-red",.dependencies."@node-red-contrib-themes/midnight-red")'
else
  JQ_CMD='del(.dependencies.npm,.dependencies."node-red",.dependencies."@node-red-contrib-themes/midnight-red")'
fi

cat addon_files/redmatic/lib/package.json | jq $JQ_CMD > $DEST/package.json

scp $DEST/package.json $REMOTE:$REMOTE_PATH

ssh -t $REMOTE "cd $REMOTE_PATH ; env JOBS=max npm install --global-style --no-package-lock"
ssh -t $REMOTE "cd $REMOTE_PATH ; env JOBS=max npm rebuild"

if ! [ $ARCH == "i686" ]; then
  ssh -t $REMOTE "cd $REMOTE_PATH/node_modules/node-red-contrib-johnny-five && npm install --save --unsafe-perm --global-style --production raspi-io"
fi

files=`ssh -t $REMOTE "cd $REMOTE_PATH ; find ./ -type f -name \*.node |grep -v obj.target"`

echo ""
echo "binaries found:"
while read -r binary; do
  echo $binary
done <<< "$files"
echo ""

read -p "looks complete? (y/n) " -n 1 -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  exit 1
fi

rm -r ${DEST}/lib/node_modules

while read -r binary; do
  from=`echo ${REMOTE}:${REMOTE_PATH}/${binary} | tr -d '\r'`
  dest=`echo ${DEST}/lib/${binary%/*} | tr -d '\r'`
  mkdir -p ${dest}
  scp -q ${from} ${dest} && echo "copying ${binary}"
done <<< "$files"

#scp $REMOTE:/usr/bin/pig2vcd $DEST/bin/
#scp $REMOTE:/usr/bin/pigpiod $DEST/bin/
#scp $REMOTE:/usr/bin/pigs $DEST/bin/
#scp $REMOTE:/usr/lib/libpigpiod_if2.so $DEST/lib/
#scp $REMOTE:/usr/lib/libpigpiod_if.so $DEST/lib/
#scp $REMOTE:/usr/lib/libpigpio.so $DEST/lib/

if ! [ $ARCH == "i686" ]; then
  echo "copying johnny-five node_modules dir"
  scp -qr $REMOTE:$REMOTE_PATH/node_modules/node-red-contrib-johnny-five/node_modules $DEST/lib/node_modules/node-red-contrib-johnny-five
fi

echo "git add"
git add $DEST/lib

echo "done."

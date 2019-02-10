#!/bin/bash

SRC=root@pi-black:/root/prebuilt/node_modules
DEST=prebuilt/armv6l/

scp $SRC/curve25519-n/build/Release/curve.node $DEST/var/node_modules/redmatic-homekit/node_modules/curve25519-n/build/Release/
scp $SRC/ed25519-hap/build/Release/ed25519.node $DEST/var/node_modules/redmatic-homekit/node_modules/ed25519-hap/build/Release/

scp -r $SRC/sqlite3/lib/binding/* $DEST/lib/node_modules/node-red-node-sqlite/node_modules/sqlite3/lib/binding/
scp $SRC/serialport/build/Release/serialport.node $DEST/lib/node_modules/node-red-node-serialport/node_modules/serialport/build/Release/

scp $SRC/unix-dgram/build/Release/unix_dgram.node $DEST/lib/node_modules/ain2/node_modules/unix-dgram/build/Release/

scp $SRC/node-red-contrib-modbus/node_modules/modbus-serial/node_modules/serialport/build/Release/serialport.node $DEST/lib/node_modules/node-red-contrib-modbus/node_modules/modbus-serial/node_modules/serialport/build/Release

scp $SRC/node-red-contrib-modbus/node_modules/@serialport/bindings/build/Release/bindings.node $DEST/lib/node_modules/node-red-contrib-modbus/node_modules/@serialport/bindings/build/Release

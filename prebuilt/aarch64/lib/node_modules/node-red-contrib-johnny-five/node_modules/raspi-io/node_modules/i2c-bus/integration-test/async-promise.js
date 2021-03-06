'use strict';

const assert = require('assert');
const i2c = require('../');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_CONFIG = 0xac;
const CMD_ACCESS_TL = 0xa2;

// Wait while non volatile memory busy
const waitForWrite = i2c1 => {
  return new Promise((resolve, reject) => {
    const checkWriteFlag = _ => {
      i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG).
      then(config => {
        if (config & 0x10) {
          checkWriteFlag();
        } else {
          resolve();
        }
      }).
      catch(reject);
    };

    checkWriteFlag();
  });
};

const finished = i2c1 =>
  i2c1.close().
  then(_ => console.log('ok - async-promise'));

const i2cFuncs = i2c1 =>
  i2c1.i2cFuncs().
  then(i2cFuncs => assert(i2cFuncs.smbusReadByte, 'expected it to be possible to read a byte'));

const scan = i2c1 =>
  i2c1.scan().
  then(devices => assert(
    devices.includes(DS1621_ADDR),
    'expected scan to find a ds1621 at address 0x' + DS1621_ADDR.toString(16)
  ));

// Test i2cWrite & i2cRead
// Change value of tl to 25 and verify that tl has been changed
const i2cPlainReadWrite = i2c1 => {
  const cmdSetTL = Buffer.from([CMD_ACCESS_TL, 25, 0]);
  const cmdGetTL = Buffer.from([CMD_ACCESS_TL]);
  const tl = Buffer.alloc(2);

  return i2c1.i2cWrite(DS1621_ADDR, cmdSetTL.length, cmdSetTL).
  then(block => {
    assert.strictEqual(block.bytesWritten, cmdSetTL.length, 'expected i2cWrite to write 3 bytes');
    assert.strictEqual(cmdSetTL, block.buffer, 'expected cmdSetTL to be block.buffer');
  }).
  then(_ => waitForWrite(i2c1)).
  then(_ => i2c1.i2cWrite(DS1621_ADDR, cmdGetTL.length, cmdGetTL)).
  then(block => {
    assert.strictEqual(block.bytesWritten, cmdGetTL.length, 'expected i2cWrite to write 1 byte');
    assert.strictEqual(cmdGetTL, block.buffer, 'expected cmdGetTL to be block.buffer');
  }).
  then(_ => i2c1.i2cRead(DS1621_ADDR, 2, tl)).
  then(block => {
    assert.strictEqual(block.bytesRead, 2, 'expected i2cRead to read 2 bytes');
    assert.strictEqual(tl.readUInt16LE(0), 25, 'expected i2cRead to read value 25');
    assert.strictEqual(tl, block.buffer, 'expected tl to be block.buffer');
  });
};

// Test writeI2cBlock & readI2cBlock
// Change value of tl to 22 and verify that tl has been changed
const readWriteI2cBlock = i2c1 => {
  const newtl = Buffer.alloc(10);
  newtl.writeUInt16LE(22, 0);

  return i2c1.writeI2cBlock(DS1621_ADDR, CMD_ACCESS_TL, 2, newtl).
    then(block => {
      assert.strictEqual(block.bytesWritten, 2, 'expected writeI2cBlock to write 2 bytes');
      assert.strictEqual(newtl, block.buffer, 'expected newtl to be block.buffer');
    }).
    then(_ => waitForWrite(i2c1)).
    then(_ => i2c1.readI2cBlock(DS1621_ADDR, CMD_ACCESS_TL, 2, newtl)).
    then(block => {
      assert.strictEqual(block.bytesRead, 2, 'expected readI2cBlock to read 2 bytes');
      assert.strictEqual(block.buffer.readUInt16LE(0), 22, 'expected readI2cBlock to read value 22');
      assert.strictEqual(newtl, block.buffer, 'expected newtl to be block.buffer');
    });
};

// Test writeWord & readWord
// Change value of tl and verify that tl has been changed
const readWriteWord = i2c1 =>
  i2c1.readWord(DS1621_ADDR, CMD_ACCESS_TL).
  then(oldtl => {
    assert(typeof oldtl === 'number' && oldtl <= 0xffff, 'expeted readWord to read a word');
    const newtl = (oldtl === 24 ? 23 : 24);
    return i2c1.writeWord(DS1621_ADDR, CMD_ACCESS_TL, newtl).
      then(_ => i2c1.readWord(DS1621_ADDR, CMD_ACCESS_TL)).
      then(newtl2 => {
        assert(typeof newtl2 === 'number' && newtl2 <= 0xffff, 'expeted readWord to read a word');
        assert.strictEqual(newtl, newtl2, 'expected to read word written');
      });
  });

// Test sendByte & receiveByte
// Read config and verify that it's epectedConfig
const sendReceiveByte = (i2c1, epectedConfig) =>
  i2c1.sendByte(DS1621_ADDR, CMD_ACCESS_CONFIG).
  then(_ => i2c1.receiveByte(DS1621_ADDR)).
  then(config => {
    assert(typeof config === 'number' && config <= 0xff, 'expeted receiveByte to receive a byte');
    assert.strictEqual(config, epectedConfig, '1st and 2nd config read differ');
  });

// Test writeByte & readByte
// Enter continuous mode and verify that continuous mode has been entered
const readWriteByte = i2c1 =>
  i2c1.writeByte(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x0).
  then(_ => waitForWrite(i2c1)).
  then(_ => i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG)).
  then(config => {
    assert(typeof config === 'number' && config <= 0xff, 'expeted readByte to read a byte');
    assert.strictEqual(config & 0x1, 0, 'continuous mode not eneterd');
    return config;
  });

i2c.openPromisified(1).
then(i2c1 => readWriteByte(i2c1).
  then(config => sendReceiveByte(i2c1, config)).
  then(_ => readWriteWord(i2c1)).
  then(_ => readWriteI2cBlock(i2c1)).
  then(_ => i2cPlainReadWrite(i2c1)).
  then(_ => scan(i2c1)).
  then(_ => i2cFuncs(i2c1)).
  then(_ => finished(i2c1))
).
catch(console.log);


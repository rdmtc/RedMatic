'use strict';

const assert = require('assert');
const i2c = require('../');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_CONFIG = 0xac;
const CMD_ACCESS_TL = 0xa2;

const i2c1 = i2c.openSync(1);

// Wait while non volatile memory busy
const waitForWrite = _ => {
  while (i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }
};

// Test writeByteSync & readByteSync
// Enter one shot mode and verify that one shot mode has been entered
const readWriteByte = _ => {
  const self = i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);
  assert.strictEqual(self, i2c1, 'expected writeByteSync to return this');
  waitForWrite();
  const config = i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert(typeof config === 'number' && config <= 0xff, 'expeted readByteSync to read a byte');
  assert.strictEqual(config & 0x1, 1, 'one shot mode not eneterd');
};

// Test sendByteSync & receiveByteSync
// Read config using different techniques and verify that 1st and 2nd read
// are identical
const sendReceiveByte = _ => {
  const expectedConfig = i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert(typeof expectedConfig === 'number' && expectedConfig <= 0xff, 'expeted readByteSync to read a byte');

  const self = i2c1.sendByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert.strictEqual(self, i2c1, 'expected sendByteSync to return this');

  const config = i2c1.receiveByteSync(DS1621_ADDR);
  assert(typeof config === 'number' && config <= 0xff, 'expeted receiveByteSync to receive a byte');
  assert.strictEqual(config, expectedConfig, '1st and 2nd config read differ');
};

// Test writeWordSync & readWordSync
// Change value of tl and verify that tl has been changed
const readWriteWord = _ => {
  const oldtl = i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
  assert(typeof oldtl === 'number' && oldtl <= 0xffff, 'expeted readWordSync to read a word');

  const tl = (oldtl === 24 ? 23 : 24);

  const self = i2c1.writeWordSync(DS1621_ADDR, CMD_ACCESS_TL, tl);
  assert.strictEqual(self, i2c1, 'expected writeWordSync to return this');
  waitForWrite();

  const newtl = i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
  assert(typeof newtl === 'number' && newtl <= 0xffff, 'expeted readWordSync to read a word');
  assert.strictEqual(tl, newtl, 'expected to read word written');
};

// Test writeI2cBlockSync & readI2cBlockSync
// Change value of tl to 22 and verify that tl has been changed
const readWriteI2cBlock = _ => {
  const tlbuf = Buffer.alloc(10);
  tlbuf.writeUInt16LE(22, 0);
  const self = i2c1.writeI2cBlockSync(DS1621_ADDR, CMD_ACCESS_TL, 2, tlbuf);
  assert.strictEqual(self, i2c1, 'expected writeI2cBlockSync to return this');
  waitForWrite();

  const newtl = Buffer.alloc(10);
  const bytesRead = i2c1.readI2cBlockSync(DS1621_ADDR, CMD_ACCESS_TL, 2, newtl);
  assert.strictEqual(bytesRead, 2, 'expected readI2cBlockSync to read 2 bytes');
  assert.strictEqual(newtl.readUInt16LE(0), 22, 'expected readI2cBlockSync to read value 22');
};

// Test i2cWriteSync & i2cReadSync
// Change value of tl to 25 and verify that tl has been changed
const i2cPlainReadWrite = _ => {
  const cmdSetTL = Buffer.from([CMD_ACCESS_TL, 25, 0]);
  let bytesWritten = i2c1.i2cWriteSync(DS1621_ADDR, cmdSetTL.length, cmdSetTL);
  assert.strictEqual(bytesWritten, 3, 'expected i2cWriteSync to write 3 bytes');
  waitForWrite();

  const cmdGetTL = Buffer.from([CMD_ACCESS_TL]);
  bytesWritten = i2c1.i2cWriteSync(DS1621_ADDR, cmdGetTL.length, cmdGetTL);
  assert.strictEqual(bytesWritten, 1, 'expected i2cWriteSync to write 1 byte');

  const tl = Buffer.alloc(2);
  const bytesRead = i2c1.i2cReadSync(DS1621_ADDR, 2, tl);
  assert.strictEqual(bytesRead, 2, 'expected i2cReadSync to read 2 bytes');
  assert.strictEqual(tl.readUInt16LE(0), 25, 'expected i2cReadSync to read value 25');
};

readWriteByte();
sendReceiveByte();
readWriteWord();
readWriteI2cBlock();
i2cPlainReadWrite();

i2c1.closeSync();

console.log('ok - sync');


'use strict';

const assert = require('assert');
const i2c = require('../');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_TL = 0xa2;

const i2c1 = i2c.openSync(1);

for (let i = 1; i <= 1000000; i += 1) {
  const tlbuf = Buffer.alloc(1000000);
  const bytesRead = i2c1.readI2cBlockSync(DS1621_ADDR, CMD_ACCESS_TL, 2, tlbuf);
  assert.strictEqual(bytesRead, 2, 'expected readI2cBlockSync to read 2 bytes');
  if (i % 1000 === 0) {
    console.log(i);
  }
}

i2c1.closeSync();


'use strict';

const i2c = require('../');

const ITERATIONS = 5000;

const DS1621_ADDR = 0x48;
const CMD_ACCESS_TL = 0xa2;

const i2c1 = i2c.openSync(1);
const cmdGetTL = Buffer.from([CMD_ACCESS_TL]);
const tl = Buffer.alloc(2);

let time = process.hrtime();

// one operation is an i2cWriteSync and an i2cReadSync, i.e., two calls
for (let operations = 1; operations <= ITERATIONS; operations += 1) {
  i2c1.i2cWriteSync(DS1621_ADDR, cmdGetTL.length, cmdGetTL);
  i2c1.i2cReadSync(DS1621_ADDR, 2, tl);
}

time = process.hrtime(time);
const opsPerSec = Math.floor(ITERATIONS / (time[0] + time[1] / 1E9));

i2c1.closeSync();

console.log('ok - sync-plain-i2c-performance - ' + opsPerSec + ' (x 2) operations per second');


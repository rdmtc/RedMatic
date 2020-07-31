'use strict';

const i2c = require('../');

const ITERATIONS = 5000;

const DS1621_ADDR = 0x48;
const CMD_ACCESS_TL = 0xa2;

const i2c1 = i2c.openSync(1);

let time = process.hrtime();

for (let reads = 1; reads <= ITERATIONS; reads += 1) {
  i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
}

time = process.hrtime(time);
const readsPerSec = Math.floor(ITERATIONS / (time[0] + time[1] / 1E9));

i2c1.closeSync();

console.log('ok - sync-performance - ' + readsPerSec + ' reads per second');


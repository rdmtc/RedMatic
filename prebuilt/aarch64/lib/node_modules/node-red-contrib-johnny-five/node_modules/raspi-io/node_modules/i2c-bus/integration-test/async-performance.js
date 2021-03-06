'use strict';

const i2c = require('../');

const ITERATIONS = 5000;

const DS1621_ADDR = 0x48;
const CMD_ACCESS_TL = 0xa2;

let time;

const performanceTest = testRuns => {
  i2c1.readWord(DS1621_ADDR, CMD_ACCESS_TL, _ => {
    testRuns -= 1;
    if (testRuns === 0) {
      time = process.hrtime(time);
      const readsPerSec = Math.floor(ITERATIONS / (time[0] + time[1] / 1E9));
      i2c1.closeSync();
      console.log('ok - async-performance - ' + readsPerSec + ' reads per second');
    } else {
      performanceTest(testRuns);
    }
  });
};

const i2c1 = i2c.open(1, _ => {
  time = process.hrtime();
  performanceTest(ITERATIONS);
});


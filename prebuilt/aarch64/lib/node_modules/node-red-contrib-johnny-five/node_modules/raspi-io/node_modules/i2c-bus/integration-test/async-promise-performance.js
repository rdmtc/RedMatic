'use strict';

const i2c = require('../');

const ITERATIONS = 5000;

const DS1621_ADDR = 0x48;
const CMD_ACCESS_TL = 0xa2;

let time;

const performanceTest = (i2c1, testRuns) => {
  i2c1.readWord(DS1621_ADDR, CMD_ACCESS_TL).then(word => {
    testRuns -= 1;
    if (testRuns === 0) {
      time = process.hrtime(time);
      const readsPerSec = Math.floor(ITERATIONS / (time[0] + time[1] / 1E9));
      i2c1.close().then(_ =>
        console.log('ok - async-promise-performance - ' + readsPerSec + ' reads per second')
      );
    } else {
      performanceTest(i2c1, testRuns);
    }
  });
};

i2c.openPromisified(1).then(i2c1 => {
  time = process.hrtime();
  performanceTest(i2c1, ITERATIONS);
});


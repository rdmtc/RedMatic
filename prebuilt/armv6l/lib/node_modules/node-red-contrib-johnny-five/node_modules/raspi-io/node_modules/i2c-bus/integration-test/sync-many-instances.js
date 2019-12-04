'use strict';

const i2c = require('../');

const DS1621_ADDR = 0x48;
const DS1621_CMD_ACCESS_TH = 0xa1;
const DS1621_CMD_ACCESS_TL = 0xa2;

const TSL2561_ADDR = 0x39;
const TSL2561_CMD = 0x80;
const TSL2561_REG_ID = 0x0a;

const useBusMoreThanMaxFdTimes = _ => {
  // Assuming that less than 2000 files can be opened at the same time,
  // open and close /dev/i2c-1 2000 times to make sure it works and to ensure
  // that file descriptors are being freed.
  for (let i = 1; i <= 2000; i += 1) {
    const i2c1 = i2c.openSync(1);
    i2c1.readWordSync(DS1621_ADDR, DS1621_CMD_ACCESS_TL);
    i2c1.closeSync();
  }
};

const useMultipleObjectsForSameBusConcurrently = _ => {
  const buses = [];

  // Make sure many Bus objects can be opened and used for the same I2C bus at
  // the same time.
  for (let i = 1; i <= 128; i += 1) {
    buses.push(i2c.openSync(1));
  }
  buses.forEach(bus => bus.readWordSync(DS1621_ADDR, DS1621_CMD_ACCESS_TL));
  buses.forEach(bus => bus.closeSync());
};

const useTwoObjectsForSameBusConcurrently = _ => {
  const ds1621 = i2c.openSync(1);
  const tsl2561 = i2c.openSync(1);
  const ds1621TempHigh = ds1621.readWordSync(DS1621_ADDR, DS1621_CMD_ACCESS_TH);
  const tsl2561Id = tsl2561.readByteSync(TSL2561_ADDR, TSL2561_CMD | TSL2561_REG_ID);

  console.log('  ds1621TempHigh: ' + ds1621TempHigh);
  console.log('  tsl2561Id: ' + tsl2561Id);
};

useBusMoreThanMaxFdTimes();
useMultipleObjectsForSameBusConcurrently();
useTwoObjectsForSameBusConcurrently();

console.log('ok - sync-many-instances');


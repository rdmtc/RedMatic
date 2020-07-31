'use strict';

const i2c = require('../');

const DS1621_ADDR = 0x48;
const DS1621_CMD_ACCESS_TH = 0xa1;

const TSL2561_ADDR = 0x39;
const TSL2561_CMD = 0x80;
const TSL2561_REG_ID = 0x0a;

const i2c1 = i2c.open(1, err => {
  if (err) {
    throw err;
  }

  const readDs1621TempHigh = _ => {
    i2c1.readWord(DS1621_ADDR, DS1621_CMD_ACCESS_TH, (err, tempHigh) => {
      if (err) {
        throw err;
      }
      console.log(tempHigh);
      readDs1621TempHigh();
    });
  };

  const readTsl2561Id = _ => {
    i2c1.readByte(TSL2561_ADDR, TSL2561_CMD | TSL2561_REG_ID, (err, id) => {
      if (err) {
        throw err;
      }
      console.log(id);
      readTsl2561Id();
    });
  };

  readDs1621TempHigh();
  readTsl2561Id();
});


'use strict';

const async = require('async');
const i2c = require('../');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_CONFIG = 0xac;
const CMD_READ_TEMP = 0xaa;
const CMD_START_CONVERT = 0xee;

const toCelsius = rawTemp => {
  const halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

  if ((halfDegrees & 0x100) === 0) {
    return halfDegrees / 2; // Temp +ve
  }

  return -((~halfDegrees & 0xff) / 2); // Temp -ve
};

const displayTemperature = _ => {
  let i2c1;

  async.series([
    cb => i2c1 = i2c.open(1, cb),

    // Enter one shot mode (this is a non volatile setting)
    cb => i2c1.writeByte(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01, cb),

    // Wait while non volatile memory busy
    cb => {
      const wait = _ => {
        i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, (err, config) => {
          if (err) {
            return cb(err);
          }
          if (config & 0x10) {
            return wait();
          }
          cb(null);
        });
      };

      wait();
    },

    // Start temperature conversion
    cb => i2c1.sendByte(DS1621_ADDR, CMD_START_CONVERT, cb),

    // Wait for temperature conversion to complete
    cb => {
      const wait = _ => {
        i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, (err, config) => {
          if (err) {
            return cb(err);
          }
          if ((config & 0x80) === 0) {
            return wait();
          }
          cb(null);
        });
      };

      wait();
    },

    // Display temperature
    cb => {
      i2c1.readWord(DS1621_ADDR, CMD_READ_TEMP, (err, rawTemp) => {
        if (err) {
          return cb(err);
        }
        console.log('temp: ' + toCelsius(rawTemp));
        cb(null);
      });
    },

    cb => i2c1.close(cb)
  ], err => {
    if (err) {
      throw err;
    }
  });
};

displayTemperature();


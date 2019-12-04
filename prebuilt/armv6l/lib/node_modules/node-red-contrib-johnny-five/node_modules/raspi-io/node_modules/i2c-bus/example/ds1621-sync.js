'use strict';

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
  const i2c1 = i2c.openSync(1);

  // Enter one shot mode (this is a non volatile setting)
  i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);

  // Wait while non volatile memory busy
  while (i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }

  // Start temperature conversion
  i2c1.sendByteSync(DS1621_ADDR, CMD_START_CONVERT);

  // Wait for temperature conversion to complete
  while ((i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x80) === 0) {
  }

  // Display temperature
  const rawTemp = i2c1.readWordSync(DS1621_ADDR, CMD_READ_TEMP);
  console.log('temp: ' + toCelsius(rawTemp));

  i2c1.closeSync();
};

displayTemperature();


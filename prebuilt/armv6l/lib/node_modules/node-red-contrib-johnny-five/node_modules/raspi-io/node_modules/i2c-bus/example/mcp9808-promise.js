'use strict';

const i2c = require('../');

const MCP9808_ADDR = 0x18;
const TEMP_REG = 0x05;

const toCelsius = rawData => {
  rawData = (rawData >> 8) + ((rawData & 0xff) << 8);
  let celsius = (rawData & 0x0fff) / 16;
  if (rawData & 0x1000) {
    celsius -= 256;
  }
  return celsius;
};

i2c.openPromisified(1).
then(i2c1 => i2c1.readWord(MCP9808_ADDR, TEMP_REG).
  then(rawData => console.log(toCelsius(rawData))).
  then(_ => i2c1.close())
).catch(console.log);


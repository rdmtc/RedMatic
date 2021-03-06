'use strict';

const i2c = require('../');

const MCP9808_ADDR = 0x18;
const TEMP_REG = 0x05;

const toCelsius = rawData => {
  let celsius = (rawData & 0x0fff) / 16;
  if (rawData & 0x1000) {
    celsius -= 256;
  }
  return celsius;
};

const wbuf = Buffer.from([TEMP_REG]);
const rbuf = Buffer.alloc(2);

i2c.openPromisified(1).
then(i2c1 => i2c1.i2cWrite(MCP9808_ADDR, wbuf.length, wbuf).
  then(_ => i2c1.i2cRead(MCP9808_ADDR, rbuf.length, rbuf)).
  then(data => console.log(toCelsius(data.buffer.readUInt16BE()))).
  then(_ => i2c1.close())
).catch(console.log);


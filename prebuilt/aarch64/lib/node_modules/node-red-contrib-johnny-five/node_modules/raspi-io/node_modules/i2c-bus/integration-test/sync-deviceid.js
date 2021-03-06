'use strict';

const i2c = require('../');

const address = 0x50;
const invalid = 0x42;

const readDeviceId = _ => {
  const i2c1 = i2c.openSync(42);
  const id = i2c1.deviceIdSync(address);

  console.log('id for address', '0x' + address.toString(16), id);

  //
  try {
    i2c1.deviceIdSync(invalid);
  } catch(e) {
    i2c1.closeSync();
    return;
  }

  throw Error('should have exited though catch');
};

readDeviceId();


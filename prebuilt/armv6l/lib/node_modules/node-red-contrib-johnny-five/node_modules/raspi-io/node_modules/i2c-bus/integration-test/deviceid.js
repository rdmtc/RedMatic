'use strict';

const i2c = require('../');
const i2c1 = i2c.openSync(42);

const address = 0x50;

i2c1.deviceId(address, (err, id) => {
  if (err) {
    console.log('error', err);
  } else {
    console.log('id for address', '0x' + address.toString(16), id);
  }

  i2c1.closeSync();
});


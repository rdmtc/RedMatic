'use strict';

const i2c = require('../');
const i2c1 = i2c.openSync(1);
const i2cfuncs = i2c1.i2cFuncsSync();
const platform = i2cfuncs.smbusQuick ? 'Raspberry Pi?' : 'BeagleBone?';

i2c1.closeSync();

console.log('ok - i2c-functionality-available - ' + platform);


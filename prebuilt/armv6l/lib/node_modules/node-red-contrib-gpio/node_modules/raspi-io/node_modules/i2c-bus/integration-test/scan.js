'use strict';

const _ = require('lodash');
const assert = require('assert');
const i2c = require('../');

const TSL2561_ADDR = 0x39;
const DS1621_ADDR = 0x48;

const bus = i2c.openSync(1);

const scanSyncRange = () => {
  const devices = bus.scanSync(TSL2561_ADDR, DS1621_ADDR);

  assert(devices.length === 2, 'expected 2 devices');
  assert(
    devices[0] === TSL2561_ADDR,
    'expected device at address 0x' + TSL2561_ADDR.toString(16)
  );
  assert(
    devices[1] === DS1621_ADDR,
    'expected device at address 0x' + DS1621_ADDR.toString(16)
  );

  console.log('ok - scan');
};

const scanSyncForSingleDevice = () => {
  const devices = bus.scanSync(DS1621_ADDR);

  assert(devices.length === 1, 'expected 1 device');
  assert(
    devices[0] === DS1621_ADDR,
    'expected device at address 0x' + DS1621_ADDR.toString(16)
  );

  scanSyncRange();
};

const scanRange = () => {
  bus.scan(TSL2561_ADDR, DS1621_ADDR, (err, devices) => {
    assert(!err, 'can\'t scan range');
    assert(devices.length === 2, 'expected 2 devices');
    assert(
      devices[0] === TSL2561_ADDR,
      'expected device at address 0x' + TSL2561_ADDR.toString(16)
    );
    assert(
      devices[1] === DS1621_ADDR,
      'expected device at address 0x' + DS1621_ADDR.toString(16)
    );

    scanSyncForSingleDevice();
  });
};

const scanForSingleDevice = () => {
  bus.scan(DS1621_ADDR, (err, devices) => {
    assert(!err, 'can\'t scan for single device');
    assert(devices.length === 1, 'expected 1 device');
    assert(
      devices[0] === DS1621_ADDR,
      'expected device at address 0x' + DS1621_ADDR.toString(16)
    );

    scanRange();
  });
};

const scanDefaultRange = () => {
  const addresses = bus.scanSync();

  bus.scan((err, devices) => {
    assert(!err, 'can\'t scan default range');
    assert(_.isEqual(addresses, devices), 'sync and async scan differ');

    scanForSingleDevice();
  });
};

scanDefaultRange();


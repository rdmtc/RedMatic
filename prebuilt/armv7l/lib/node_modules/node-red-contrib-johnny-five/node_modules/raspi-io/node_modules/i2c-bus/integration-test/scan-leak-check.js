'use strict';

const lodash = require('lodash');
const assert = require('assert');
const i2c = require('../');

const bus = i2c.openSync(1);
let count = 0;

const next = _ => {
  const addresses = bus.scanSync();

  bus.scan((err, devices) => {
    assert(!err, 'can\'t scan for devices');
    assert(lodash.isEqual(addresses, devices), 'sync and async scan differ');

    count += 1;
    if (count % 10 === 0) {
      console.log(count);
    }

    next();
  });
};

next();


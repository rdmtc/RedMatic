'use strict';

const assert = require('assert');
const i2c = require('../');

const openPromisified = _ =>
  i2c.openPromisified(1).
  then(promisifiedBus => {
    assert.strictEqual(
      promisifiedBus, promisifiedBus.bus().promisifiedBus(),
      'expected promisifiedBus.bus().promisifiedBus() to return promisifiedBus'
    );

    const bus = promisifiedBus.bus();
    assert.strictEqual(
      bus, bus.promisifiedBus().bus(),
      'expected bus.promisifiedBus().bus() to return bus'
    );

    return promisifiedBus.close();
  }).
  then(_ => console.log('ok - busses')).
  catch(console.log);

const open = _ => {
  const bus = i2c.open(1, err => {
    assert(!err, 'can\'t open i2c bus');

    assert.strictEqual(
      bus, bus.promisifiedBus().bus(),
      'expected bus.promisifiedBus().bus() to return bus'
    );

    const promisifiedBus = bus.promisifiedBus();
    assert.strictEqual(
      promisifiedBus, promisifiedBus.bus().promisifiedBus(),
      'expected promisifiedBus.bus().promisifiedBus() to return promisifiedBus'
    );

    openPromisified();
  });
};

open();


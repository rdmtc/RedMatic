/*
The MIT License (MIT)

Copyright (c) 2014-2017 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*global describe, it, expect */

const Peripheral = require('../dist/index.js').Peripheral;

describe('Peripheral Tests', () => {
  it('can create a peripheral', () => {
    const myPeripheral = new Peripheral('GPIO2');
    expect(myPeripheral.pins.length).toBe(1);
    expect(myPeripheral.pins.indexOf(8)).not.toBe(-1);
    expect(myPeripheral.alive).toBe(true);
    expect(global.raspiPinUsage[8]).toBe(myPeripheral);
  });

  it('can create a new peripheral over the old one', () => {
    const myPeripheral = new Peripheral(13);
    expect(myPeripheral.pins.length).toBe(1);
    expect(myPeripheral.pins.indexOf(13)).not.toBe(-1);
    expect(myPeripheral.alive).toBe(true);
    expect(global.raspiPinUsage[13]).toBe(myPeripheral);

    const myOtherPeripheral = new Peripheral(13);
    expect(myOtherPeripheral.pins.length).toBe(1);
    expect(myPeripheral.pins.indexOf(13)).not.toBe(-1);
    expect(myPeripheral.alive).toBe(false);
    expect(myOtherPeripheral.pins.indexOf(13)).not.toBe(-1);
    expect(myOtherPeripheral.alive).toBe(true);
    expect(global.raspiPinUsage[13]).toBe(myOtherPeripheral);
  });

  it('can create a multi-pin peripheral', () => {
    const myPeripheral = new Peripheral([ 'SDA0', 'SCL0' ]);
    expect(myPeripheral.pins.length).toBe(2);
    expect(myPeripheral.pins.indexOf(8)).not.toBe(-1);
    expect(myPeripheral.pins.indexOf(9)).not.toBe(-1);
    expect(myPeripheral.alive).toBe(true);
    expect(global.raspiPinUsage[8]).toBe(myPeripheral);
    expect(global.raspiPinUsage[9]).toBe(myPeripheral);
  });

  it ('can create a multi-pin peripheral over an old one', () => {
    const myPeripheral = new Peripheral([ 'SDA0', 'SCL0' ]);
    expect(myPeripheral.pins.length).toBe(2);
    expect(myPeripheral.pins.indexOf(8)).not.toBe(-1);
    expect(myPeripheral.pins.indexOf(9)).not.toBe(-1);
    expect(myPeripheral.alive).toBe(true);
    expect(global.raspiPinUsage[8]).toBe(myPeripheral);
    expect(global.raspiPinUsage[9]).toBe(myPeripheral);

    const myOtherPeripheral = new Peripheral([ 'SDA0', 'GPIO9' ]);
    expect(myOtherPeripheral.pins.length).toBe(2);
    expect(myOtherPeripheral.pins.indexOf(8)).not.toBe(-1);
    expect(myOtherPeripheral.pins.indexOf(13)).not.toBe(-1);
    expect(myOtherPeripheral.alive).toBe(true);
    expect(global.raspiPinUsage[8]).toBe(myOtherPeripheral);
    expect(global.raspiPinUsage[13]).toBe(myOtherPeripheral);
    expect(global.raspiPinUsage[9]).toBeUndefined();
    expect(myPeripheral.alive).toBe(false);
  });

  it ('can query validateAlive', () => {
    const myPeripheral = new Peripheral(13);
    expect(myPeripheral.validateAlive.bind(myPeripheral)).not.toThrow();

    const myOtherPeripheral = new Peripheral(13);
    expect(myOtherPeripheral.validateAlive.bind(myOtherPeripheral)).not.toThrow();
    expect(myPeripheral.validateAlive.bind(myPeripheral)).toThrow();
  });

  it ('can\'t create peripherals with invalid pins', () => {
    let exception = false;
    try {
      new Peripheral(['fake']);
    } catch(e) {
      expect(e.message).toBe('Invalid pin: fake');
      exception = true;
    }
    expect(exception).toBe(true);
  });
});
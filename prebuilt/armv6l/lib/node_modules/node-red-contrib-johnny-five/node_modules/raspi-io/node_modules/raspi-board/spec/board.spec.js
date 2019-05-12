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

const board = require('../dist/index.js');

describe('Raspi Board', () => {

  it('Expects the correct board revision to be determined', () => {
    const revision = board.getBoardRevision();
    expect(revision).toEqual(board.VERSION_2_MODEL_B);
  });

  it('sets up the proper pin aliases and modes', () => {
    const pins = board.getPins();
    expect(pins[8].pins.length).toEqual(3);
    expect(pins[8].pins.indexOf('GPIO2')).not.toEqual(-1);
    expect(pins[8].pins.indexOf('SDA0')).not.toEqual(-1);
    expect(pins[8].pins.indexOf('P1-3')).not.toEqual(-1);
    expect(pins[8].peripherals.length).toEqual(2);
    expect(pins[8].peripherals.indexOf('gpio')).not.toEqual(-1);
    expect(pins[8].peripherals.indexOf('i2c')).not.toEqual(-1);
  });

  it('resolves pins correctly', () => {
    expect(board.getPinNumber('GPIO2')).toEqual(8);
    expect(board.getPinNumber('TXD0')).toEqual(15);
    expect(board.getPinNumber('P1-12')).toEqual(1);
    expect(board.getPinNumber(10)).toEqual(10);
    expect(board.getPinNumber(0)).toEqual(0);
    expect(board.getPinNumber('10')).toEqual(10);
    expect(board.getPinNumber(50)).toBeNull();
    expect(board.getPinNumber('fake')).toBeNull();
  });

  it('resolves GPIO pin numbers correctly', () => {
    expect(board.getGpioNumber('GPIO2')).toEqual(2);
    expect(board.getGpioNumber('TXD0')).toEqual(14);
    expect(board.getGpioNumber('P1-12')).toEqual(18);
    expect(board.getGpioNumber(10)).toEqual(8);
    expect(board.getGpioNumber(0)).toEqual(17);
    expect(board.getGpioNumber('10')).toEqual(8);
    expect(board.getGpioNumber(50)).toBeNull();
    expect(board.getGpioNumber('fake')).toBeNull();
  });

  it('correctly does not resolve invalid pin numbers', () => {
    expect(board.getPinNumber()).toBeNull();
    expect(board.getPinNumber([])).toBeNull();
    expect(board.getPinNumber({})).toBeNull();
    expect(board.getPinNumber(function() {})).toBeNull();
    expect(board.getPinNumber(/foo/)).toBeNull();
  });

});

Raspi Board
===========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/nebrius/raspi-board.svg?branch=master)](https://travis-ci.org/nebrius/raspi-board)
[![Coverage Status](https://coveralls.io/repos/github/nebrius/raspi-board/badge.svg?branch=master)](https://coveralls.io/github/nebrius/raspi-board?branch=master)

Raspi Board provides pin mapping functionality for the various Raspberry Pi models. This module is meant to be run on a physical Raspberry Pi _only_, and maps pins for the specific board it is being run on.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users), except compute modules.
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 6.0.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

## Installation

Install with npm:

```Shell
npm install raspi-board
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example

```JavaScript
const board = require('raspi-board');

// Prints 14
console.log(board.getPinNumber('SCLK0'));
```

## Pin Naming

The pins on the Raspberry Pi are a little complicated. There are multiple headers on some Raspberry Pis with extra pins, and the pin numbers are not consistent between Raspberry Pi board versions.

To help make it easier, you can specify pins in three ways. The first is to specify the pin by function, e.g. ```'GPIO18'```. The second way is to specify by pin number, which is specified in the form "P[header]-[pin]", e.g. ```'P1-7'```. The final way is specify the [Wiring Pi virtual pin number](http://wiringpi.com/pins/), e.g. ```7```. If you specify a number instead of a string, it is assumed to be a Wiring Pi number.

Be sure to read the [full list of pins](https://github.com/nebrius/raspi-io/wiki/Pin-Information) on the supported models of the Raspberry Pi.

## API

### Module Constants

<table>
  <thead>
    <tr>
      <th>Constant</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>VERSION_1_MODEL_A</td>
    <td>Constant representing the Raspberry Pi 1 Model A. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_1_MODEL_B_REV_1</td>
    <td>Constant representing the Raspberry Pi 1 Model B Rev 1. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_1_MODEL_B_REV_2</td>
    <td>Constant representing the Raspberry Pi 1 Model B Rev 1. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_1_MODEL_A_PLUS</td>
    <td>Constant representing the Raspberry Pi 1 Model A+. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_1_MODEL_B_PLUS</td>
    <td>Constant representing the Raspberry Pi 1 Model B+. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_1_MODEL_ZERO</td>
    <td>Constant representing the Raspberry Pi Zero. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_1_MODEL_ZERO_W</td>
    <td>Constant representing the Raspberry Pi Zero W. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_2_MODEL_B</td>
    <td>Constant representing the Raspberry Pi 2 Model B. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_3_MODEL_B</td>
    <td>Constant representing the Raspberry Pi 3 Model B. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_3_MODEL_B_PLUS</td>
    <td>Constant representing the Raspberry Pi 3 Model B+. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_3_MODEL_A_PLUS</td>
    <td>Constant representing the Raspberry Pi 3 Model A+. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>VERSION_UNKNOWN</td>
    <td>Constant representing an unknown or unsupported version of the Raspberry Pi. Returned from <code>getBoardRevision()</code></td>
  </tr>
  <tr>
    <td>module</td>
    <td>An easily consumable object for indirectly passing this module around. Intended specifically for use by Core IO (details coming soon)</td>
  </tr>
  <tr>
    <td></td>
    <td><table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Description</th>
        </tr>
      </thead>
      <tr>
        <td>getPins</td>
        <td>Alias of the <a href="#getpins">getPins</a> method</td>
      </tr>
      <tr>
        <td>getPinNumber</td>
        <td>Alias of the <a href="#getpinnumberpin">getPinNumber</a> method</td>
      </tr>
      <tr>
        <td>getGpioNumber</td>
        <td>Alias of the <a href="#getgpionumberpin">getGpioNumber</a> method</td>
      </tr>
  </tr>
</table>

### getBoardRevision()

Gets the board revision.

_Arguments_: None.

_Returns_: A constant representing the board version, one of ```VERSION_1_MODEL_ZERO```, ```VERSION_1_MODEL_A```, ```VERSION_1_MODEL_B_REV_1```, ```VERSION_1_MODEL_B_REV_2```, ```VERSION_1_MODEL_B_PLUS```, ```VERSION_1_MODEL_A_PLUS```, ```VERSION_2_MODEL_B```, or ```VERSION_UNKNOWN```

### getPins()

Gets a list of all pins for the device it's running on.

_Arguments_: None.

_Returns_: An array of pin entry objects structured such that the array index is the Wiring Pi pin number, each with the following structure:

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>pins</td>
    <td>Array</td>
    <td>An array of all the pin names for pin, e.g. <code>['GPIO21', 'SCLK1', 'P1-40']</code></td>
  </tr>
  <tr>
    <td>peripherals</td>
    <td>Array</td>
    <td>An array of all the peripherals supported on the pin, and may contain any combination of <code>'gpio'</code>, <code>'pwm'</code>, <code>'i2c'</code>, <code>'uart'</code>, or <code>'spi'</code></td>
  </tr>
  <tr>
    <td>gpio</td>
    <td>number</td>
    <td>The GPIO number for the pin, e.g. `4` for `GPIO4`. This method works regardless of pinMode</td>
  </tr>
</table>

### getPinNumber(pin)

Normalizes a pin name to a Wiring Pi pin number. This method accounts for the differences between board revisions by checking which Raspberry Pi the code is running on.

_Arguments_:

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>pin</td>
    <td>String | Number</td>
    <td>The pin name/number to normalize. If a number is passed in, it is assumed to be the Wiring Pi pin number</td>
  </tr>
</table>

_Returns_: A number representing the Wiring Pi pin number, or null if an invalid pin name was passed in.

### getGpioNumber(pin)

Normalizes a pin name to a GPIO pin number, e.g. `TXD0`/`GPIO14` returns `14`. This method accounts for the differences between board revisions by checking which Raspberry Pi the code is running on.

_Arguments_:

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>pin</td>
    <td>String | Number</td>
    <td>The pin name/number to normalize. If a number is passed in, it is assumed to be the Wiring Pi pin number</td>
  </tr>
</table>

_Returns_: A number representing the GPIO pin number, or null if an invalid pin name was passed in.

License
=======

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

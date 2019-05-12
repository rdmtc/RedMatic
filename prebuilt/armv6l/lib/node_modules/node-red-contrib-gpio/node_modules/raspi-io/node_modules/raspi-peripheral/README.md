Raspi Peripheral
================

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/nebrius/raspi-peripheral.svg?branch=master)](https://travis-ci.org/nebrius/raspi-peripheral)
[![Coverage Status](https://coveralls.io/repos/github/nebrius/raspi-peripheral/badge.svg?branch=master)](https://coveralls.io/github/nebrius/raspi-peripheral?branch=master)

Raspi Peripheral is part of the [Raspi.js suite](https://github.com/nebrius/raspi) and provides the base class for other Raspi peripherals. Peripherals for use within the Raspi ecosystem should extend this base class. This class provides management of pins and ensures that only one peripheral can be active on any given pin at one time.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

**Warning:** This package is not intended to be used directly!

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 6.0.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

**Warning:** when using this module, it MUST be installed with user-level permissions, but run with root permissions (e.g. `sudo node index.js`).

## Installation

Install with npm:

```Shell
npm install raspi-peripheral
```

## Example

```JavaScript
import { Peripheral } from 'raspi-peripheral';

class MyPeripheral extends Peripheral {
  write(value) {
    if (this.alive) {
      // Do stuff
    }
  }
}
```

Raspi Peripheral is written in TypeScript, so writing your peripheral in TypeScript or ECMAScript 2015 is easiest, but you can also do it in ECMAScript 5:

```JavaScript
var Peripheral = require('raspi-peripheral').Peripheral;

function MyPeripheral(pin) {
  Peripheral.call(this, pin);
}
util.inherits(MyPeripheral, Peripheral);

MyPeripheral.prototype.write = function(value) {
  if (this.alive) {
    // Do stuff
  }
};
```

## Pin Naming

The pins on the Raspberry Pi are a little complicated. There are multiple headers on some Raspberry Pis with extra pins, and the pin numbers are not consistent between Raspberry Pi board versions.

To help make it easier, you can specify pins in three ways. The first is to specify the pin by function, e.g. ```'GPIO18'```. The second way is to specify by pin number, which is specified in the form "P[header]-[pin]", e.g. ```'P1-7'```. The final way is specify the [Wiring Pi virtual pin number](http://wiringpi.com/pins/), e.g. ```7```. If you specify a number instead of a string, it is assumed to be a Wiring Pi number.

Be sure to read the [full list of pins](https://github.com/nebrius/raspi-io/wiki/Pin-Information) on the supported models of the Raspberry Pi.

## API

### new Peripheral(pins)

The base constructor must be called with a single argument, the pin or pins to use. If a number or string is passed in, it is assumed to be a single pin. If an array is passed in, each entry in the array is assumed to be a single pin.

### Instance Properties

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>pins (readonly)</td>
    <td>Array</td>
    <td>The pins associated with this peripheral. This value is the normalized Wiring Pi pin number and may not be the same value that was passed to the constructor.</td>
  </tr>
  <tr>
    <td>alive (readonly)</td>
    <td>Boolean</td>
    <td>Whether or not the pin is "alive". A pin is considered not alive when the application initialized a new peripheral on the same pin as this peripheral. You should always make sure to query "alive" before performing any operation inside your peripheral instance code.</td>
  </tr>
</table>

### Instance Methods

#### destroy()

This method "destroys" the pin. Destroying a pin sets the alive flag to false and emits a "destroy" event. The ```destroy``` method is automatically called whenever a new peripheral is initialized over another peripheral.

If you need to perform any cleanup in your peripheral code, you should listen for the "destroy" event in your peripheral's constructor.

This method _should not_ be called directly. The Peripheral base class will call this method automatically when a new peripheral is initialized over the old one.

_Arguments_: None

_Returns_: None

#### validateAlive()

This method checks if the peripheral is alive or not. If the peripheral is not alive, it throws a handy exception.

_Arguments_: None

_Returns_: None

## Example gulpfile for compiling to ECMAScript 6

If you want to use ECMAScript 6 for your peripheral, here is an example gulpfile:

```JavaScript
var gulp = require('gulp');
var traceur = require('gulp-traceur');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

gulp.task('default', function() {
  return gulp.src('index.js')
    .pipe(sourcemaps.init())
      .pipe(traceur({
        modules: 'commonjs'
      }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('lib'));
});

gulp.task('clean', function(cb) {
  del(['lib/index.js'], cb);
});
```

This gulpfile assumes you have a single source file called ```index.js```. Note that the traceur runtime is loaded automatically by the Raspi Peripheral module, so there is no need to do it in your module. Make sure to include the four modules required in this file in your package.json's ```dev-dependencies``` section.

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

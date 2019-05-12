Raspi.js
==========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi.js provides initialization and base support for the Raspberry Pi. This module, along with [Raspi Board](https://github.com/nebrius/raspi-board) and [Raspi Peripheral](https://github.com/nebrius/raspi-peripheral), provide support for various peripherals on the Raspberry Pi. These libraries form the basis for [Raspi IO](https://github.com/nebrius/raspi-io), an IO plugin that adds support for the Raspberry Pi to [Johnny-Five](https://github.com/rwaldron/johnny-five).

Check out the following peripheral API modules:

* [Raspi GPIO](https://github.com/nebrius/raspi-gpio)
* [Raspi PWM](https://github.com/nebrius/raspi-pwm)
* [Raspi Software PWM](https://github.com/tralves/raspi-soft-pwm)
* [Raspi I2C](https://github.com/nebrius/raspi-i2c)
* [Raspi LED](https://github.com/nebrius/raspi-led)
* [Raspi Serial](https://github.com/nebrius/raspi-serial)

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 4.0.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

**Warning:** when using this module, it MUST be installed with user-level permissions, but run with root permissions (e.g. `sudo node index.js`).

## Installation

Install with npm:

```Shell
npm install raspi
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example Usage

In TypeScript/ES6:

```TypeScript
import { init } from 'raspi';
import { DigitalInput, DigitalOutput } from 'raspi-gpio';

init(() => {
  const input = new DigitalInput('P1-3');
  const output = new DigitalOutput('P1-5');
  output.write(input.read());
});
```

in JavaScript:

```JavaScript
const raspi = require('raspi');
const gpio = require('raspi-gpio');

raspi.init(() => {
  const input = new gpio.DigitalInput('P1-3');
  const output = new gpio.DigitalOutput('P1-5');
  output.write(input.read());
});
```

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
    <td>module</td>
    <td>An easily consumable object for indirectly passing this module around. Intended specifically for use by Core IO (details coming soon)</td>
  </tr>
  <tr>
    <td></td>
    <td><table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tr>
        <td>init</td>
        <td>Alias of the <a href="#init">init</a> method</td>
      </tr>
    </table></td>
  </tr>
</table>

### init(cb)

The ```init``` method initializes the library suite. This method MUST be called before using any peripherals.

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
    <td>cb</td>
    <td>Function</td>
    <td>Callback to be called once the board has been initialized. Takes no arguments</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <tr><td>Takes no arguments</td></tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

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

Raspi LED
==========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi LED is part of the [Raspi.js suite](https://github.com/nebrius/raspi) that provides access to the onboard status LED.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 4.0.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

## Installation

First, be sure that you have installed [raspi](https://github.com/nebrius/raspi).

Install with npm:

```Shell
npm install raspi-led
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example Usage

In TypeScript/ES6:

```JavaScript
import { init } from 'raspi';
import { LED, ON, OFF } from 'raspi-led';

init(() => {
  const statusLed = new LED();

  // Flash the LED twice a second
  setInterval(() => {
    if (statusLed.read() == ON) {
      statusLed.write(OFF); // Turn off the status LED
    } else {
      statusLed.write(ON); // Turn on the status LED
    }
  }, 500);
});
```

In JavaScript:

```JavaScript
const raspi = require('raspi');
const led = require('raspi-led');

raspi.init(() => {
  const statusLed = new led.LED();

  // Flash the LED twice a second
  setInterval(() => {
    if (statusLed.read() == led.ON) {
      statusLed.write(led.OFF); // Turn off the status LED
    } else {
      statusLed.write(led.ON); // Turn on the status LED
    }
  }, 500);
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
    <td>OFF</td>
    <td>Status value indicating the LED is off, one of the two possible return values from reads and arguments to writes</td>
  </tr>
  <tr>
    <td>ON</td>
    <td>Status value indicating the LED is on, one of the two possible return values from reads and arguments to writes</td>
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
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tr>
        <td>createLED()</td>
        <tr>Function</tr>
        <td>Pass through for the <a href="#new-led">LED constructor</a></td>
      </tr>
    </table></td>
  </tr>
</table>

### new LED()

Instantiates a new status LED instance.

_Arguments_: None

### Instance Methods

#### hasLed()

Returns whether or not a supported built-in LED was found

_Arguments_: None

_Returns_: boolean

#### read()

Reads the current status of the LED.

_Arguments_: None

_Returns_: ON or OFF

#### write(value)

Turns the LED on or off.

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
    <td>value</td>
    <td><code>ON</code> | <code>OFF</code></td>
    <td>The LED status to set</td>
  </tr>
</table>

_Returns_: None

License
=======

The MIT License (MIT)

Copyright (c) Bryan Hughes <bryan@nebri.us>

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

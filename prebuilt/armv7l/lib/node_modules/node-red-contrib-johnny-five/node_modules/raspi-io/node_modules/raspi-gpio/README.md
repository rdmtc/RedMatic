Raspi GPIO
==========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi GPIO is part of the [Raspi.js suite of libraries](https://github.com/nebrius/raspi) that provides access to the hardware GPIO pins on a Raspberry Pi.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 6.4.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

## Installation

First, be sure that you have installed [Raspi.js](https://github.com/nebrius/raspi).

Install with npm:

```Shell
npm install raspi-gpio
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example Usage

In TypeScript/ES6:

```TypeScript
import { init } from 'raspi';
import { DigitalInput, DigitalOutput, PULL_UP } from 'raspi-gpio';

init(() => {
  const input = new DigitalInput({
    pin: 'P1-3',
    pullResistor: PULL_UP
  });

  const output = new DigitalOutput('P1-5');

  output.write(input.read());
});
```

In JavaScript:

```JavaScript
const raspi = require('raspi');
const gpio = require('raspi-gpio');

raspi.init(() => {
  const input = new gpio.DigitalInput({
    pin: 'P1-3',
    pullResistor: gpio.PULL_UP
  });

  const output = new gpio.DigitalOutput('P1-5');

  output.write(input.read());
});
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
    <td>LOW</td>
    <td>A logic low value, one of the two possible return values from digital reads and arguments to digital writes</td>
  </tr>
  <tr>
    <td>HIGH</td>
    <td>A logic high value, one of the two possible return values from digital reads and arguments to digital writes</td>
  </tr>
  <tr>
    <td>PULL_NONE</td>
    <td>Do not use a pull up or pull down resistor with a pin, one of the three possible values for the <code>pullResistor</code> in the pin configuration object.</td>
  </tr>
  <tr>
    <td>PULL_DOWN</td>
    <td>Use the internal pull down resistor for a pin, one of the three possible values for the <code>pullResistor</code> in the pin configuration object.</td>
  </tr>
  <tr>
    <td>PULL_UP</td>
    <td>Use the internal pull up resistor for a pin, one of the three possible values for the <code>pullResistor</code> in the pin configuration object.</td>
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
        <td>PULL_NONE</td>
        <td>Constant</td>
        <td>Alias of PULL_NONE module export.</td>
      </tr>
      <tr>
        <td>PULL_DOWN</td>
        <td>Constant</td>
        <td>Alias of PULL_DOWN module export.</td>
      </tr>
      <tr>
        <td>PULL_UP</td>
        <td>Constant</td>
        <td>Alias of PULL_UP module export.</td>
      </tr>
      <tr>
        <td>createDigitaInput(config)</td>
        <td>String | Number | Object</td>
        <td>See the <a href="#new-digitalinputconfig">DigitalInput constructor</a> for details</td>
      </tr>
      <tr>
        <td>createDigitaOutput(config)</td>
        <td>String | Number | Object</td>
        <td>See the <a href="#new-digitaloutputconfig">DigitalOutput constructor</a> for details</td>
      </tr>
    </table></td>
  </tr>
</table>

### new DigitalInput(config)

Instantiates a new GPIO input instance.

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
    <td>config</td>
    <td>Number | String | Object</td>
    <td>The configuration for the GPIO pin. If the config is a number or string, it is assumed to be the pin number for the peripheral. If it is an object, the following properties are supported:</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>pin</td>
          <td>Number | String</td>
          <td>The pin number or descriptor for the peripheral</td>
        </tr>
        <tr>
          <td>pullResistor (optional)</td>
          <td><code>PULL_NONE</code> | <code>PULL_DOWN</code> | <code>PULL_UP</code></td>
          <td>Which internal pull resistor to enable, if any. Defaults to <code>PULL_NONE</code></td>
        </tr>
      </table>
    </td>
  </tr>
</table>

### DigitalInput Instance Properties

#### value (read-only)

The current value on the pin.

_Type:_ `LOW | HIGH`

### DigitalInput Instance Methods

#### read()

Reads the current value on the pin.

_Arguments_: None

_Returns_: `LOW` or `HIGH`

### DigitalInput Instance Events

#### on('change', function(value))

Fired whenever the value of the GPIO pin changes.

_Callback Arguments_:

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
    <td><code>LOW</code> | <code>HIGH</code></td>
    <td>The current value of the GPIO pin.</td>
  </tr>
</table>

### new DigitalOutput(config)

Instantiates a new GPIO output instance.

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
    <td>config</td>
    <td>Number | String | Object</td>
    <td>The configuration for the GPIO pin. If the config is a number or string, it is assumed to be the pin number for the peripheral. If it is an object, the following properties are supported:</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>pin</td>
          <td>Number | String</td>
          <td>The pin number for the peripheral</td>
        </tr>
        <tr>
          <td>pullResistor</td>
          <td><code>PULL_NONE</code> | <code>PULL_DOWN</code> | <code>PULL_UP</code></td>
          <td>Which internal pull resistor to enable, if any. Defaults to <code>PULL_NONE</code></td>
        </tr>
      </table>
    </td>
  </tr>
</table>

### DigitalOutput Instance Properties

#### value (read-only)

The current value on the pin, equal to the previous written value.

_Type:_ `LOW` | `HIGH`

### DigitalOutput Instance Methods

#### write(value)

Writes the given value to the pin.

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
    <td><code>LOW</code> | <code>HIGH</code></td>
    <td>The value to write to the pin</td>
  </tr>
</table>

_Returns_: None

### DigitalOutput Instance Events

#### on('change', function(value))

Fired whenever the value of the GPIO pin changes.

_Callback Arguments_:

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
    <td><code>LOW</code> | <code>HIGH</code></td>
    <td>The current value of the GPIO pin.</td>
  </tr>
</table>

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

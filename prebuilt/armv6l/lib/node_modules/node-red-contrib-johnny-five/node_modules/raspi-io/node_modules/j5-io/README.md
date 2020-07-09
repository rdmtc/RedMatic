# J5 IO

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/nebrius/j5-io.svg?branch=master)](https://travis-ci.org/nebrius/j5-io)
[![Coverage Status](https://coveralls.io/repos/github/nebrius/j5-io/badge.svg?branch=master)](https://coveralls.io/github/nebrius/j5-io?branch=master)

J5 IO is a Firmata API compatible abstract library for creating [Johnny-Five](http://johnny-five.io/) IO plugins. The API docs for this module can be found on the [Johnny-Five Wiki](https://github.com/rwaldron/io-plugins), except for the constructor which is documented below.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## Installation

Install with npm:

```Shell
npm install j5-io
```

## Usage

Using J5 IO to create a Johnny-Five IO plugin should look something like this:

```JavaScript
import { J5IO } from 'j5-io';
import { getPins } from 'raspi-board';

export function RaspiIO() {

  // Create the platform options
  const platform = {
    base: require('raspi'),
    gpio: require('raspi-gpio'),
    pwm: require('raspi-soft-pwm')
  };

  return new J5IO({
    pluginName: 'Raspi IO',
    pinInfo: getPins(),
    platform
  });
}
```

For a complete example, take a look at [Raspi IO](https://github.com/nebrius/raspi-io) which is based on this module.

## API

### new J5IO(options)

Instantiates a new J5 IO instance with the given options

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
    <td>options</td>
    <td>Object</td>
    <td>The configuration options.</td>
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
          <td>pluginName</td>
          <td>String</td>
          <td>A display name for this IO Plugin, e.g. <code>"Raspi IO"</code></td>
        </tr>
        <tr>
          <td>serialIds (optional)</td>
          <td>Object</td>
          <td>A dictionary of available serial ports. Each key is a friendly name for the port, and the value is a black box value used by the serial platform module. This object is <em>required if</em> <code>platform.serial</code> is specified. There must be one entry with a key of <code>DEFAULT</code></td>
        </tr>
        <tr>
          <td>i2cIds (optional)</td>
          <td>Object</td>
          <td>A dictionary of available I2C ports. Each key is a friendly name for the port, and the value is a black box value used by the I2C platform module. This object is <em>required if</em> <code>platform.i2c</code> is specified. There must be one entry with a key of <code>DEFAULT</code></td>
        </tr>
        <tr>
          <td>pinInfo</td>
          <td>Object</td>
          <td>Pin information about all available pins. Each key is the <em>normalized</em> value for each pin in the system. Each value is itself an object, as documented below. Note that this object is used to construct the <code>pins</code> array on the IO Plugin instance.</td>
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
                <td>pins</td>
                <td>Array&lt;Number|String&gt;</td>
                <td>All of the aliases for this pin, <em>excluding</em> the normalized pin value.</td>
              </tr>
              <tr>
                <td>peripherals</td>
                <td>Array&lt;PeripheralType&gt;</td>
                <td>All of the supported peripherals for this pin. If writing in TypeScript, use the <code>PeripheralType</code> enum from the j5-io-types package. If writing in vanilla JavaScript, is one of "gpio", "pwm", "i2c", "spi", "uart". Note that these values are used to determine the available modes for each pin</td>
              </tr>
            </table>
          </td>
        <tr>
          <td>platform</td>
          <td>Object</td>
          <td>The set of platform plugins</td>
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
                <td>base</td>
                <td>Object</td>
                <td>The "base" module to use, e.g. https://github.com/nebrius/raspi</td>
              </tr>
              <tr>
                <td>gpio</td>
                <td>Object</td>
                <td>The "gpio" module to use, e.g. https://github.com/nebrius/raspi-gpio</td>
              </tr>
              <tr>
                <td>pwm</td>
                <td>Object</td>
                <td>The "pwm" module to use, e.g. https://github.com/nebrius/raspi-soft-pwm</td>
              </tr>
              <tr>
                <td>i2c (optional)</td>
                <td>Object</td>
                <td>The "i2c" module to use, e.g. https://github.com/nebrius/raspi-i2c</td>
              </tr>
              <tr>
                <td>led (optional)</td>
                <td>Object</td>
                <td>The "led" module to use for the on-board LED not associated with pins, e.g. https://github.com/nebrius/raspi-led</td>
              </tr>
              <tr>
                <td>serial (optional)</td>
                <td>Object</td>
                <td>The "serial" module to use, e.g. https://github.com/nebrius/raspi-serial</td>
              </tr>
            </table>
          </td>
        </tr>
        </tr>
      </table>
    </td>
  </tr>
</table>

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

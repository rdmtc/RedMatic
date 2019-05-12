Raspi SOFT PWM
==============

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi Soft PWM is part of the [Raspi.js suite](https://github.com/nebrius/raspi) that provides software PWM through [pigpio](https://github.com/fivdi/pigpio).

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 6.4.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

## Installation

First, be sure that you have installed [raspi](https://github.com/nebrius/raspi).

Install with npm:

```Shell
npm install raspi-soft-pwm
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example Usage

In TypeScript/ES6:

```TypeScript
import { init } from 'raspi';
import { SoftPWM } from 'raspi-soft-pwm';

init(() => {
  const led = new SoftPWM('GPIO22');
  led.write(0.5); // 50% Duty Cycle, half brightness
});
```

In JavaScript:

```JavaScript
const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');

raspi.init(() => {
  const led = new pwm.SoftPWM('GPIO22');
  led.write(0.5); // 50% Duty Cycle, aka half brightness
});
```

## Pin Naming

The pins on the Raspberry Pi are a little complicated. There are multiple headers on some Raspberry Pis with extra pins, and the pin numbers are not consistent between Raspberry Pi board versions.

To help make it easier, you can specify pins in three ways. The first is to specify the pin by function, e.g. `'GPIO18'`. The second way is to specify by pin number, which is specified in the form "P[header]-[pin]", e.g. `'P1-7'`. The final way is specify the [Wiring Pi virtual pin number](http://wiringpi.com/pins/), e.g. `7`. If you specify a number instead of a string, it is assumed to be a Wiring Pi number.

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
        <td>createPWM(config)</td>
        <tr>Function</tr>
        <td>Pass through for the <a href="#new-softpwmconfig">PWM constructor</a></td>
      </tr>
    </table></td>
  </tr>
</table>

### new SoftPWM(config)

Instantiates a new PWM instance on the given pin.

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
    <td>config (optional)</td>
    <td>Number | String | Object</td>
    <td>The configuration for the PWM pin. If the config is a number or string, it is assumed to be the pin number for the peripheral. If it is an object, the following properties are supported:</td>
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
          <td>pin (optional)</td>
          <td>Number | String</td>
          <td>The pin number or descriptor for the peripheral. Defaults to 1 (GPIO18, PWM0).</td>
        </tr>
        <tr>
          <td>frequency (optional)</td>
          <td>Number</td>
          <td>The frequency, in Hz, of the PWM signal. Defaults to 50.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

### Instance Properties

#### frequency

A number representing the frequency initialization value, in Hz. If a value for `frequency` was passed to the constructor, it is reflected back here. If no value for `frequency` was passed to the constructor, then this reflects the default frequency value of `50`.

### Instance Methods

#### write(dutyCycle)

Sets the duty cycle for the PWM output, a floating point value between 0 and 1.

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
    <td>dutyCycle</td>
    <td>Number</td>
    <td>The duty cycle for the PWM to set, must be a floating point number between 0 and 1</td>
  </tr>
</table>

_Returns_: None

**Note:** The PWM does not start outputting a signal until write is called for the first time.

## Credits

This package was largely based on [Bryan Hughes](https://github.com/nebrius)' work and advice. He is the creator of [raspi](https://github.com/nebrius/raspi).
Also, [Brian Cooke](https://github.com/fivdi), creator of [pigpio](https://github.com/fivdi/pigpio), the package that actually does all the work.

License
=======

The MIT License (MIT)

Copyright (c) Tiago Alves <tralves@gmail.com> and Bryan Hughes <bryan@nebri.us>

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

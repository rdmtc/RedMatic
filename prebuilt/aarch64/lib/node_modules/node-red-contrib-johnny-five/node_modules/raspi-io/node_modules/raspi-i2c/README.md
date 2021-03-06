Raspi I2C
=========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi I2C is part of the [Raspi.js suite](https://github.com/nebrius/raspi) that provides access to the hardware I2C on pins 3 (SDA0) and 5 (SCL0).

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 6.0.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

## Installation

First, be sure that you have installed [raspi](https://github.com/nebrius/raspi).

Install with npm:

```Shell
npm install raspi-i2c
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example Usage

In TypeScript/ES6:

```TypeScript
import { init } from 'raspi';
import { I2C } from 'raspi-i2c';

init(() => {
  const i2c = new I2C();
  console.log(i2c.readByteSync(0x18)); // Read one byte from the device at address 18
});
```

In JavaScript:

```JavaScript
const raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;

raspi.init(() => {
  const i2c = new I2C();
  console.log(i2c.readByteSync(0x18)); // Read one byte from the device at address 18
});
```

## Notes and Limitations

There are a few limitations and extra steps to be aware of when using I2C on the Raspberry Pi.

First and foremost, be aware that once you use an I2C pin for GPIO, you _cannot_ use it for I2C again until you _reboot_ your Raspberry Pi! If you run the following [Johnny-Five](http://johnny-five.io/) code which leverages this library under the hood, you will get an exception stating "I2C pins not in I2C mode."

```JavaScript
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  io: new Raspi()
});

board.on('ready', () => {
  new five.Pin('SDA');
  board.io.i2cWrite(0x18, 0x5, 'hello');
});
```

Also note that you will need to edit ```/boot/config.txt``` in order to change the I2C baud rate from the default, if you need to. If you notice that behavior is unstable while trying to communicate with another microcontroller, try setting the baudrate to 10000 from the default 100000. This instability has been observed on the Arduino Nano before.

After you install Raspi IO for the first time, you _must_ reboot your Raspberry Pi. I2C support is not enabled by default, and this module runs a script to enable it automatically and adjust a few I2C settings. These settings will not take effect until you reboot your Pi.

Finally, if you try to access a device that doesn't exist, you will get an error stating ```EIO, i/o error``` (sorry it's not very descriptive).

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
        <td>createI2C()</td>
        <tr>Function</tr>
        <td>Pass through for the <a href="#new-i2c">I2C constructor</a></td>
      </tr>
    </table></td>
  </tr>
</table>

### new I2C(pins)

Instantiates a new I2C instance on the given pins. Note that I2C is limited to only 1 pair of pins on all current models of the Raspberry Pi. Check the [wiring information wiki](https://github.com/nebrius/raspi-io/wiki) for more information.

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
    <td>pins (optional)</td>
    <td>Number[] | Object</td>
    <td>The configuration of the I2C port. If the config is an array of numbers or strings, it is assumed to be the SDA and SCL pins for the peripheral. If it is an object, the following properties are supported:</td>
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
          <td></td>
          <td></td>
        </tr>
      </table>
    </td>
  </tr>
</table>

### Instance Methods

#### read(address, register, length, cb)

Reads data from the peripheral at _address_ from the optional _register_ and calls the callback once _length_ bytes have been read.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>length</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be between 0 and 0xff.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call once the read is complete</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | null</td>
          <td>The error, if one occurred, else null</td>
        </tr>
        <tr>
          <td>data</td>
          <td>null | Buffer</td>
          <td>If no error occurred, the read data</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### readSync(address, register, length)

Synchronous version of ```read```.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>length</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be between 0 and 0xff.</td>
  </tr>
</table>

_Returns_: A buffer containing the read data

#### readByte(address, register, cb)

Reads a single byte from the peripheral at _address_ from the optional _register_ and calls the callback.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call once the read is complete</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | null</td>
          <td>The error, if one occurred, else null</td>
        </tr>
        <tr>
          <td>data</td>
          <td>null | Number</td>
          <td>If no error occurred, the read byte</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### readByteSync(address, register)

Synchronous version of ```readByte```.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
</table>

_Returns_: The byte in the form of a number.

#### readWord(address, register, cb)

Reads a single word from the peripheral at _address_ from the optional _register_ and calls the callback.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call once the read is complete</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | null</td>
          <td>The error, if one occurred, else null</td>
        </tr>
        <tr>
          <td>data</td>
          <td>null | Number</td>
          <td>If no error occurred, the read byte</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### readWordSync(address, register)

Synchronous version of ```readWord```.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
</table>

_Returns_: The word in the form of a number.

#### write(address, register, buffer, cb)

Writes the data in _buffer_ to the peripheral at _address_ to the optional _register_ and calls the callback once the write has completed.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>buffer</td>
    <td>Buffer</td>
    <td>The data to write to the peripheral.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call once the write is complete</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | null</td>
          <td>The error, if one occurred, else null</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### writeSync(address, register, buffer)

Synchronous version of ```write```.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to read from. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>buffer</td>
    <td>Buffer</td>
    <td>The data to write to the peripheral.</td>
  </tr>
</table>

_Returns_: None

#### writeByte(address, register, byte, cb)

Writes _byte_ to peripheral at _address_ to the optional _register_ and calls the callback.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to write to. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>byte</td>
    <td>Number</td>
    <td>The byte to write. The value is coerced to an unsigned 8-bit integer.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call once the write is complete</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | null</td>
          <td>The error, if one occurred, else null</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### writeByteSync(address, register, byte)

Synchronous version of ```writeByte```.

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to write to. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>byte</td>
    <td>Number</td>
    <td>The byte to write. The value is coerced to an unsigned 8-bit integer.</td>
  </tr>
</table>

_Returns_: None

#### writeWord(address, register, word, cb)

Writes _word_ to peripheral at _address_ to the optional _register_ and calls the callback.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to write to. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>word</td>
    <td>Number</td>
    <td>The word to write. The value is coerced to an unsigned 16-bit integer.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call once the write is complete</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | null</td>
          <td>The error, if one occurred, else null</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### writeWordSync(address, register, word)

Synchronous version of ```writeWord```.

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
    <td>address</td>
    <td>Number</td>
    <td>The address of the peripheral to read from. Must be 0 or greater and less than 0x80.</td>
  </tr>
  <tr>
    <td>register (optional)</td>
    <td>Number</td>
    <td>The register to write to. Must be between 0 and 0x7f.</td>
  </tr>
  <tr>
    <td>word</td>
    <td>Number</td>
    <td>The word to write. The value is coerced to an unsigned 16-bit integer.</td>
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

[![Build Status](https://travis-ci.org/fivdi/i2c-bus.svg?branch=master)](https://travis-ci.org/fivdi/i2c-bus)
[![Coverage Status](https://coveralls.io/repos/github/fivdi/i2c-bus/badge.svg)](https://coveralls.io/github/fivdi/i2c-bus)
[![npm Version](http://img.shields.io/npm/v/i2c-bus.svg)](https://www.npmjs.com/package/i2c-bus)
[![Downloads Per Month](http://img.shields.io/npm/dm/i2c-bus.svg)](https://www.npmjs.com/package/i2c-bus)
[![Mentioned in Awesome Node.js](https://awesome.re/mentioned-badge.svg)](https://github.com/sindresorhus/awesome-nodejs#hardware)

# i2c-bus

I2C serial bus access with **Node.js** on Linux boards like the Raspberry Pi,
C.H.I.P., BeagleBone or Intel Edison. All methods have asynchronous and
synchronous forms.

i2c-bus supports Node.js versions 4, 6, 8, 10 and 12.

## Contents

 * [Installation](#installation)
 * [Usage](#usage)
 * [API](#api)

## Installation

```
npm install i2c-bus
```

The way in which I2C is configured varies from board to board. Sometimes no
configuraton is required, but sometimes it is:

* [Configuring I2C on the Raspberry Pi](https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-i2c.md)
* [Configuring Software I2C on the Raspberry Pi](https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-software-i2c.md)
  * Consider software I2C when there are issues communicating with a device on a Raspberry Pi
* [Configuring I2C on the Intel Edison Arduino Base Board](https://github.com/fivdi/i2c-bus/blob/master/doc/edison-adruino-base-board-i2c.md)

## Usage

### Example Temperature Sensor Circuits

Some of the examples programs use a
[DS1621 temperature sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS1621.html)
to show how the i2c-bus package functions. 

**DS1621 temperature sensor connected to a Raspberry Pi**
<img src="https://github.com/fivdi/i2c-bus/raw/master/example/ds1621-pi.png">

**DS1621 temperature sensor connected to a BeagleBone Black**
<img src="https://github.com/fivdi/i2c-bus/raw/master/example/ds1621-bb.png">

### Example 1 - Determine Temperature Synchronously

Determine the temperature with a DS1621 temperature sensor Synchronously.

```js
const i2c = require('i2c-bus');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_CONFIG = 0xac;
const CMD_READ_TEMP = 0xaa;
const CMD_START_CONVERT = 0xee;

const toCelsius = (rawTemp) => {
  const halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

  if ((halfDegrees & 0x100) === 0) {
    return halfDegrees / 2; // Temp +ve
  }

  return -((~halfDegrees & 0xff) / 2); // Temp -ve
};

const displayTemperature = () => {
  const i2c1 = i2c.openSync(1);

  // Enter one shot mode (this is a non volatile setting)
  i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);

  // Wait while non volatile memory busy
  while (i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }

  // Start temperature conversion
  i2c1.sendByteSync(DS1621_ADDR, CMD_START_CONVERT);

  // Wait for temperature conversion to complete
  while ((i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x80) === 0) {
  }

  // Display temperature
  const rawTemp = i2c1.readWordSync(DS1621_ADDR, CMD_READ_TEMP);
  console.log('temp: ' + toCelsius(rawTemp));

  i2c1.closeSync();
};

displayTemperature();
```

### Example 2 - Determine Temperature Asynchronously

Determine the temperature with a DS1621 temperature sensor Asynchronously.
Example 2 does exactly the same thing as example 1, but uses the asynchronous
rather than the synchronous API.

```js
const async = require('async');
const i2c = require('i2c-bus');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_CONFIG = 0xac;
const CMD_READ_TEMP = 0xaa;
const CMD_START_CONVERT = 0xee;

const toCelsius = (rawTemp) => {
  const halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

  if ((halfDegrees & 0x100) === 0) {
    return halfDegrees / 2; // Temp +ve
  }

  return -((~halfDegrees & 0xff) / 2); // Temp -ve
};

const displayTemperature = () => {
  let i2c1;

  async.series([
    (cb) => i2c1 = i2c.open(1, cb),

    // Enter one shot mode (this is a non volatile setting)
    (cb) => i2c1.writeByte(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01, cb),

    // Wait while non volatile memory busy
    (cb) => {
      const wait = () => {
        i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, (err, config) => {
          if (err) return cb(err);
          if (config & 0x10) return wait();
          cb(null);
        });
      };

      wait();
    },

    // Start temperature conversion
    (cb) => i2c1.sendByte(DS1621_ADDR, CMD_START_CONVERT, cb),

    // Wait for temperature conversion to complete
    (cb) => {
      const wait = () => {
        i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, (err, config) => {
          if (err) return cb(err);
          if ((config & 0x80) === 0) return wait();
          cb(null);
        });
      };

      wait();
    },

    // Display temperature
    (cb) => {
      i2c1.readWord(DS1621_ADDR, CMD_READ_TEMP, (err, rawTemp) => {
        if (err) return cb(err);
        console.log('temp: ' + toCelsius(rawTemp));
        cb(null);
      });
    },

    (cb) => i2c1.close(cb)
  ], (err) => {
    if (err) throw err;
  });
};

displayTemperature();
```

### Example 3 - Accessing Multiple Devices Asynchronously and Concurrently

This example demonstrates concurrent asynchronous access to two devices on the
same bus, a DS1621 temperature sensor and an
[Adafruit TSL2561 digital luminosity/lux/light sensor](http://www.adafruit.com/products/439).

```js
const i2c = require('i2c-bus');

const DS1621_ADDR = 0x48;
const DS1621_CMD_ACCESS_TH = 0xa1;

const TSL2561_ADDR = 0x39;
const TSL2561_CMD = 0x80;
const TSL2561_REG_ID = 0x0a;

const i2c1 = i2c.open(1, (err) => {
  if (err) throw err;

  const readDs1621TempHigh = () => {
    i2c1.readWord(DS1621_ADDR, DS1621_CMD_ACCESS_TH, (err, tempHigh) => {
      if (err) throw err;
      console.log(tempHigh);
      readDs1621TempHigh();
    });
  };

  const readTsl2561Id = () => {
    i2c1.readByte(TSL2561_ADDR, TSL2561_CMD | TSL2561_REG_ID, (err, id) => {
      if (err) throw err;
      console.log(id);
      readTsl2561Id();
    });
  };

  readDs1621TempHigh();
  readTsl2561Id();
});
```

## API

All methods have asynchronous and synchronous forms.

The asynchronous form always take a completion callback as its last argument.
The arguments passed to the completion callback depend on the method, but the
first argument is always reserved for an exception. If the operation was
completed successfully, then the first argument will be null or undefined.

When using the synchronous form any exceptions are immediately thrown. You can
use try/catch to handle exceptions or allow them to bubble up. 

### Methods

- [open(busNumber [, options], cb)](#openbusnumber--options-cb)
- [openSync(busNumber [, options])](#opensyncbusnumber--options)

### Class Bus

- Free resources
  - [bus.close(cb)](#busclosecb)
  - [bus.closeSync()](#busclosesync)

- Information
  - [bus.i2cFuncs(cb)](#busi2cfuncscb)
  - [bus.i2cFuncsSync()](#busi2cfuncssync)
  - [bus.scan([startAddr,] [endAddr,] cb)](#busscanstartaddr-endaddr-cb)
  - [bus.scanSync([startAddr,] [endAddr])](#busscansyncstartaddr-endaddr)
  - [bus.deviceId(addr, cb)](#busdeviceidaddr-cb)
  - [bus.deviceIdSync(addr)](#busdeviceidsyncaddr)

- Plain I2C
  - [bus.i2cRead(addr, length, buffer, cb)](#busi2creadaddr-length-buffer-cb)
  - [bus.i2cReadSync(addr, length, buffer)](#busi2creadsyncaddr-length-buffer)
  - [bus.i2cWrite(addr, length, buffer, cb)](#busi2cwriteaddr-length-buffer-cb)
  - [bus.i2cWriteSync(addr, length, buffer)](#busi2cwritesyncaddr-length-buffer)

- SMBus
  - [bus.readByte(addr, cmd, cb)](#busreadbyteaddr-cmd-cb)
  - [bus.readByteSync(addr, cmd)](#busreadbytesyncaddr-cmd)
  - [bus.readWord(addr, cmd, cb)](#busreadwordaddr-cmd-cb)
  - [bus.readWordSync(addr, cmd)](#busreadwordsyncaddr-cmd)
  - [bus.readI2cBlock(addr, cmd, length, buffer, cb)](#busreadi2cblockaddr-cmd-length-buffer-cb)
  - [bus.readI2cBlockSync(addr, cmd, length, buffer)](#busreadi2cblocksyncaddr-cmd-length-buffer)
  - [bus.receiveByte(addr, cb)](#busreceivebyteaddr-cb)
  - [bus.receiveByteSync(addr)](#busreceivebytesyncaddr)
  - [bus.sendByte(addr, byte, cb)](#bussendbyteaddr-byte-cb)
  - [bus.sendByteSync(addr, byte)](#bussendbytesyncaddr-byte)
  - [bus.writeByte(addr, cmd, byte, cb)](#buswritebyteaddr-cmd-byte-cb)
  - [bus.writeByteSync(addr, cmd, byte)](#buswritebytesyncaddr-cmd-byte)
  - [bus.writeWord(addr, cmd, word, cb)](#buswritewordaddr-cmd-word-cb)
  - [bus.writeWordSync(addr, cmd, word)](#buswritewordsyncaddr-cmd-word)
  - [bus.writeQuick(addr, bit, cb)](#buswritequickaddr-bit-cb)
  - [bus.writeQuickSync(addr, bit)](#buswritequicksyncaddr-bit)
  - [bus.writeI2cBlock(addr, cmd, length, buffer, cb)](#buswritei2cblockaddr-cmd-length-buffer-cb)
  - [bus.writeI2cBlockSync(addr, cmd, length, buffer)](#buswritei2cblocksyncaddr-cmd-length-buffer)

### Class I2cFuncs

- [funcs.i2c](#funcsi2c---boolean)
- [funcs.tenBitAddr](#funcstenbitaddr---boolean)
- [funcs.protocolMangling](#funcsprotocolmangling---boolean)
- [funcs.smbusPec](#funcssmbuspec---boolean)
- [funcs.smbusBlockProcCall](#funcssmbusblockproccall---boolean)
- [funcs.smbusQuick](#funcssmbusquick---boolean)
- [funcs.smbusReceiveByte](#funcssmbusreceivebyte---boolean)
- [funcs.smbusSendByte](#funcssmbussendbyte---boolean)
- [funcs.smbusReadByte](#funcssmbusreadbyte---boolean)
- [funcs.smbusWriteByte](#funcssmbuswritebyte---boolean)
- [funcs.smbusReadWord](#funcssmbusreadword---boolean)
- [funcs.smbusWriteWord](#funcssmbuswriteword---boolean)
- [funcs.smbusProcCall](#funcssmbusproccall---boolean)
- [funcs.smbusReadBlock](#funcssmbusreadblock---boolean)
- [funcs.smbusWriteBlock](#funcssmbuswriteblock---boolean)
- [funcs.smbusReadI2cBlock](#funcssmbusreadi2cblock---boolean)
- [funcs.smbusWriteI2cBlock](#funcssmbuswritei2cblock---boolean)

### open(busNumber [, options], cb)
- busNumber - the number of the I2C bus/adapter to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...
- options - an optional options object
- cb - completion callback

Asynchronous open. Returns a new Bus object. The callback gets one argument (err).

The following options are supported:
- forceAccess - A boolean value specifying whether access to devices on the
I2C bus should be allowed even if they are already in use by a kernel
driver/module. Corresponds to I2C_SLAVE_FORCE on Linux. The valid values for
forceAccess are true and false. Optional, the default value is false.

### openSync(busNumber [, options])
- busNumber - the number of the I2C bus/adapter to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...
- options - an optional options object

Synchronous open. Returns a new Bus object.

The following options are supported:
- forceAccess - A boolean value specifying whether access to devices on the
I2C bus should be allowed even if they are already in use by a kernel
driver/module. Corresponds to I2C_SLAVE_FORCE on Linux. The valid values for
forceAccess are true and false. Optional, the default value is false.

### bus.close(cb)
- cb - completion callback

Asynchronous close. The callback gets one argument (err).

### bus.closeSync()

Synchronous close.

### bus.i2cFuncs(cb)
- cb - completion callback

Determine functionality of the bus/adapter asynchronously. The callback gets
two argument (err, funcs). funcs is a frozen
[I2cFuncs](#class-i2cfuncs)
object describing the functionality available.
See also [I2C functionality](https://www.kernel.org/doc/Documentation/i2c/functionality).

### bus.i2cFuncsSync()

Determine functionality of the bus/adapter Synchronously. Returns a frozen
[I2cFuncs](#class-i2cfuncs)
object describing the functionality available.
See also [I2C functionality](https://www.kernel.org/doc/Documentation/i2c/functionality).

### bus.scan([startAddr,] [endAddr,] cb)
- startAddr - an integer specifying the start address of the scan range, optional
- endAddr - an integer specifying the end addrerss of the scan range, optional
- cb - completion callback

bus.scan(cb) - scan for I2C devices in address range 0x03 through 0x77 <br/>
bus.scan(addr, cb) - scan for an I2C device at address addr <br/>
bus.scan(startAddr, endAddr, cb) - scan for I2C devices in address range startAddr through endAddr <br/>

Scans the I2C bus asynchronously for devices. The default address range 0x03
through 0x77 is the same as the default address range used by the `i2cdetect`
command line tool. The callback gets two arguments (err, devices). devices is
an array of numbers where each number represents the I2C address of a device
which was detected.

### bus.scanSync([startAddr,] [endAddr])
- startAddr - an integer specifying the start address of the scan range, optional
- endAddr - an integer specifying the end addrerss of the scan range, optional

bus.scan() - scan for I2C devices in address range 0x03 through 0x77 <br/>
bus.scan(addr) - scan for an I2C device at address addr <br/>
bus.scan(startAddr, endAddr) - scan for I2C devices in address range startAddr through endAddr <br/>

Scans the I2C bus synchronously for devices. The default address range 0x03
through 0x77 is the same as the default address range used by the `i2cdetect`
command line tool. Returns an array of numbers where each number represents
the I2C address of a device which was detected.

### bus.deviceId(addr, cb)
- addr - I2C device address
- cb - completion callback

Asynchronous I2C device Id.  The callback gets two arguments (err, id). id is
an object with the properties `manufacturer`, `product` and if known a human
readable `name` for the associated manufacturer. `manufacturer` and `product`
are numbers, `name` is a string.

### bus.deviceIdSync(addr)
- addr - I2C device address

Synchronous I2C device Id. Returns an object with the properties 
`manufacturer`, `product` and if known a human readable `name` for the
associated manufacturer. `manufacturer` and `product` are numbers, `name` is a
string.

### bus.i2cRead(addr, length, buffer, cb)
- addr - I2C device address
- length - an integer specifying the number of bytes to read
- buffer - the buffer that the data will be written to (must conatin at least length bytes)
- cb - completion callback

Asynchronous plain I2C read. The callback gets three argument (err, bytesRead, buffer).
bytesRead is the number of bytes read.

### bus.i2cReadSync(addr, length, buffer)
- addr - I2C device address
- length - an integer specifying the number of bytes to read
- buffer - the buffer that the data will be written to (must conatin at least length bytes)

Synchronous plain I2C read. Returns the number of bytes read.

### bus.i2cWrite(addr, length, buffer, cb)
- addr - I2C device address
- length - an integer specifying the number of bytes to write
- buffer - the buffer containing the data to write (must conatin at least length bytes)
- cb - completion callback

Asynchronous plain I2C write. The callback gets three argument (err, bytesWritten, buffer).
bytesWritten is the number of bytes written.

### bus.i2cWriteSync(addr, length, buffer)
- addr - I2C device address
- length - an integer specifying the number of bytes to write
- buffer - the buffer containing the data to write (must conatin at least length bytes)

Synchronous plain I2C write. Returns the number of bytes written.

### bus.readByte(addr, cmd, cb)
- addr - I2C device address
- cmd - command code
- cb - completion callback

Asynchronous SMBus read byte. The callback gets two arguments (err, byte).

### bus.readByteSync(addr, cmd)
- addr - I2C device address
- cmd - command code

Synchronous SMBus read byte. Returns the byte read.

### bus.readWord(addr, cmd, cb)
- addr - I2C device address
- cmd - command code
- cb - completion callback

Asynchronous SMBus read word. The callback gets two arguments (err, word).

### bus.readWordSync(addr, cmd)
- addr - I2C device address
- cmd - command code

Synchronous SMBus read word. Returns the word read.

### bus.readI2cBlock(addr, cmd, length, buffer, cb)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to read (max 32)
- buffer - the buffer that the data will be written to (must conatin at least length bytes)
- cb - completion callback

Asynchronous I2C block read (not defined by the SMBus specification). Reads a
block of bytes from a device, from a designated register that is specified by
cmd. The callback gets three arguments (err, bytesRead, buffer). bytesRead is
the number of bytes read.

### bus.readI2cBlockSync(addr, cmd, length, buffer)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to read (max 32)
- buffer - the buffer that the data will be written to (must conatin at least length bytes)

Synchronous I2C block read (not defined by the SMBus specification). Reads a
block of bytes from a device, from a designated register that is specified by
cmd. Returns the number of bytes read.

### bus.receiveByte(addr, cb)
- addr - I2C device address
- cb - completion callback

Asynchronous SMBus receive byte. The callback gets two arguments (err, byte).

### bus.receiveByteSync(addr)
- addr - I2C device address

Synchronous SMBus receive byte. Returns the byte received.

### bus.sendByte(addr, byte, cb)
- addr - I2C device address
- byte - data byte
- cb - completion callback

Asynchronous SMBus send byte. The callback gets one argument (err).

### bus.sendByteSync(addr, byte)
- addr - I2C device address
- byte - data byte

Synchronous SMBus send byte.

### bus.writeByte(addr, cmd, byte, cb)
- addr - I2C device address
- cmd - command code
- byte - data byte
- cb - completion callback

Asynchronous SMBus write byte. The callback gets one argument (err).

### bus.writeByteSync(addr, cmd, byte)
- addr - I2C device address
- cmd - command code
- byte - data byte

Synchronous SMBus write byte.

### bus.writeWord(addr, cmd, word, cb)
- addr - I2C device address
- cmd - command code
- word - data word
- cb - completion callback

Asynchronous SMBus write word. The callback gets one argument (err).

### bus.writeWordSync(addr, cmd, word)
- addr - I2C device address
- cmd - command code
- word - data word

Synchronous SMBus write word.

### bus.writeQuick(addr, bit, cb)
- addr - I2C device address
- bit - bit to write (0 or 1)
- cb - completion callback

Asynchronous SMBus quick command. Writes a single bit to the device.
The callback gets one argument (err).

### bus.writeQuickSync(addr, bit)
- addr - I2C device address
- bit - bit to write (0 or 1)

Synchronous SMBus quick command. Writes a single bit to the device.

### bus.writeI2cBlock(addr, cmd, length, buffer, cb)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to write (max 32)
- buffer - the buffer containing the data to write (must conatin at least length bytes)
- cb - completion callback

Asynchronous I2C block write (not defined by the SMBus specification). Writes a
block of bytes to a device, to a designated register that is specified by cmd.
The callback gets three argument (err, bytesWritten, buffer). bytesWritten is
the number of bytes written.

### bus.writeI2cBlockSync(addr, cmd, length, buffer)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to write (max 32)
- buffer - the buffer containing the data to write (must conatin at least length bytes)

Synchronous I2C block write (not defined by the SMBus specification). Writes a
block of bytes to a device, to a designated register that is specified by cmd.

### funcs.i2c - boolean
Specifies whether or not the adapter handles plain I2C-level commands (Pure
SMBus adapters typically can not do these,
I2C_FUNC_I2C).

### funcs.tenBitAddr - boolean
Specifies whether or not the adapter handles the 10-bit address extensions
(I2C_FUNC_10BIT_ADDR).

### funcs.protocolMangling - boolean
Specifies whether or not the adapter knows about the I2C_M_IGNORE_NAK,
I2C_M_REV_DIR_ADDR and I2C_M_NO_RD_ACK flags (which modify the I2C protocol!
I2C_FUNC_PROTOCOL_MANGLING).

### funcs.smbusPec - boolean
Specifies whether or not the adapter handles packet error checking
(I2C_FUNC_SMBUS_PEC).

### funcs.smbusBlockProcCall - boolean
Specifies whether or not the adapter handles the SMBus block process call
command
(I2C_FUNC_SMBUS_BLOCK_PROC_CALL).

### funcs.smbusQuick - boolean
Specifies whether or not the adapter handles the SMBus quick command
(I2C_FUNC_SMBUS_QUICK).

### funcs.smbusReceiveByte - boolean
Specifies whether or not the adapter handles the SMBus receive byte command
(I2C_FUNC_SMBUS_READ_BYTE).

### funcs.smbusSendByte - boolean
Specifies whether or not the adapter handles the SMBus send byte command
(I2C_FUNC_SMBUS_WRITE_BYTE).

### funcs.smbusReadByte - boolean
Specifies whether or not the adapter handles the SMBus read byte command
(I2C_FUNC_SMBUS_READ_BYTE_DATA).

### funcs.smbusWriteByte - boolean
Specifies whether or not the adapter handles the SMBus write byte command
(I2C_FUNC_SMBUS_WRITE_BYTE_DATA).

### funcs.smbusReadWord - boolean
Specifies whether or not the adapter handles the SMBus read word command
(I2C_FUNC_SMBUS_READ_WORD_DATA).

### funcs.smbusWriteWord - boolean
Specifies whether or not the adapter handles the SMBus write word command
(I2C_FUNC_SMBUS_WRITE_WORD_DATA).

### funcs.smbusProcCall - boolean
Specifies whether or not the adapter handles the SMBus process call command
(I2C_FUNC_SMBUS_PROC_CALL).

### funcs.smbusReadBlock - boolean
Specifies whether or not the adapter handles the SMBus read block command
(I2C_FUNC_SMBUS_READ_BLOCK_DATA).

### funcs.smbusWriteBlock - boolean
Specifies whether or not the adapter handles the SMBus write block command
(I2C_FUNC_SMBUS_WRITE_BLOCK_DATA).

### funcs.smbusReadI2cBlock - boolean
Specifies whether or not the adapter handles the SMBus read I2C block command
(I2C_FUNC_SMBUS_READ_I2C_BLOCK).

### funcs.smbusWriteI2cBlock - boolean
Specifies whether or not the adapter handles the SMBus write i2c block command
(I2C_FUNC_SMBUS_WRITE_I2C_BLOCK).


'use strict';

const fs = require('fs');
const i2c = require('bindings')('i2c.node');

const BUS_FILE_PREFIX = '/dev/i2c-';
const FIRST_SCAN_ADDR = 0x03;
const LAST_SCAN_ADDR = 0x77;

// Table 4.
// https://www.nxp.com/docs/en/user-guide/UM10204.pdf
const knownManufacturers = [
  { value: 0x000, name: 'NXP Semiconductors' },
  { value: 0x001, name: 'NXP Semiconductors (reserved)' },
  { value: 0x002, name: 'NXP Semiconductors (reserved)' },
  { value: 0x003, name: 'NXP Semiconductors (reserved)' },
  { value: 0x004, name: 'Ramtron International' },
  { value: 0x005, name: 'Analog Devices' },
  { value: 0x006, name: 'STMicroelectronics' },
  { value: 0x007, name: 'ON Semiconductor' },
  { value: 0x008, name: 'Sprintek Corporation' },
  { value: 0x009, name: 'ESPROS Photonics AG' },
  { value: 0x00a, name: 'Fujitsu Semiconductor' },
  { value: 0x00b, name: 'Flir' },
  { value: 0x00c, name: 'O\u2082Micro' },
  { value: 0x00d, name: 'Atmel' }
];

const open = (busNumber, options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = undefined;
  }

  checkBusNumber(busNumber);
  checkCallback(cb);

  const bus = new Bus(busNumber, options);

  setImmediate(cb, null);

  return bus;
};

const openSync = (busNumber, options) => {
  checkBusNumber(busNumber);

  return new Bus(busNumber, options);
};

const openPromisified = (busNumber, options) => new Promise(
  (resolve, reject) => {
    const bus = open(busNumber, options,
      err => err ? reject(err) : resolve(bus.promisifiedBus())
    );
  }
);

const checkBusNumber = busNumber => {
  if (!Number.isInteger(busNumber) || busNumber < 0) {
    throw new Error('Invalid I2C bus number ' + busNumber);
  }
};

const checkAddress = addr => {
  if (!Number.isInteger(addr) || addr < 0  || addr > 0x7f) {
    throw new Error('Invalid I2C address ' + addr);
  }
};

const checkCommand = cmd => {
  if (!Number.isInteger(cmd) || cmd < 0  || cmd > 0xff) {
    throw new Error('Invalid I2C command ' + cmd);
  }
};

const checkCallback = cb => {
  if (typeof cb !== 'function') {
    throw new Error('Invalid callback ' + cb);
  }
};

const checkBuffer = buffer => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer ' + buffer);
  }
};

const checkBufferAndLength = (length, buffer, maxLength) => {
  if (!Number.isInteger(length) ||
      length < 0 ||
      (maxLength !== undefined && length > maxLength)) {
    throw new Error('Invalid buffer length ' + length);
  }

  checkBuffer(buffer);

  if (buffer.length < length) {
    throw new Error('Buffer must contain at least ' + length + ' bytes');
  }
};

const checkByte = byte => {
  if (!Number.isInteger(byte) || byte < 0  || byte > 0xff) {
    throw new Error('Invalid byte ' + byte);
  }
};

const checkWord = word => {
  if (!Number.isInteger(word) || word < 0  || word > 0xffff) {
    throw new Error('Invalid word ' + word);
  }
};

const checkBit = bit => {
  if (!Number.isInteger(bit) || bit < 0  || bit > 1) {
    throw new Error('Invalid bit ' + bit);
  }
};

const parseId = id => {
  // Figure 20. UM10204
  const manufacturer = id >> 12 & 0x0fff; // high 12bit
  const product = id & 0x0fff; // low 12bit

  const known = knownManufacturers.find(man => man.value === manufacturer);
  const name = known !== undefined ? known.name : ('<0x' + manufacturer.toString(16) + '>');

  return {
    manufacturer: manufacturer,
    product: product,
    name: name
  };
};

const peripheral = (bus, addr, cb) => {
  const device = bus._peripherals[addr];

  if (device === undefined) {
    fs.open(BUS_FILE_PREFIX + bus._busNumber, 'r+', (err, device) => {
      if (err) {
        return cb(err);
      }

      bus._peripherals[addr] = device;

      i2c.setAddrAsync(device, addr, bus._forceAccess, err => {
        if (err) {
          return cb(err);
        }

        cb(null, device);
      });
    });
  } else {
    setImmediate(cb, null, device);
  }
};

const peripheralSync = (bus, addr) => {
  let peripheral = bus._peripherals[addr];

  if (peripheral === undefined) {
    peripheral = fs.openSync(BUS_FILE_PREFIX + bus._busNumber, 'r+');
    bus._peripherals[addr] = peripheral;
    i2c.setAddrSync(peripheral, addr, bus._forceAccess);
  }

  return peripheral;
};

class I2cFuncs {
  constructor(i2cFuncBits) {
    this.i2c = !!(i2cFuncBits & i2c.I2C_FUNC_I2C);
    this.tenBitAddr = !!(i2cFuncBits & i2c.I2C_FUNC_10BIT_ADDR);
    this.protocolMangling = !!(i2cFuncBits & i2c.I2C_FUNC_PROTOCOL_MANGLING);
    this.smbusPec = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_PEC);
    this.smbusBlockProcCall = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_BLOCK_PROC_CALL);
    this.smbusQuick = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_QUICK);
    this.smbusReceiveByte = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_BYTE);
    this.smbusSendByte = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_BYTE);
    this.smbusReadByte = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_BYTE_DATA);
    this.smbusWriteByte = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_BYTE_DATA);
    this.smbusReadWord = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_WORD_DATA);
    this.smbusWriteWord = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_WORD_DATA);
    this.smbusProcCall = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_PROC_CALL);
    this.smbusReadBlock = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_BLOCK_DATA);
    this.smbusWriteBlock = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_BLOCK_DATA);
    this.smbusReadI2cBlock = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_I2C_BLOCK);
    this.smbusWriteI2cBlock = !!(i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_I2C_BLOCK);
  }
}

class Bus {
  constructor(busNumber, options) {
    options = options || {};

    this._busNumber = busNumber;
    this._forceAccess = !!options.forceAccess || false;
    this._peripherals = [];
    this._promisifiedBus = new PromisifiedBus(this);
  }

  promisifiedBus() {
    return this._promisifiedBus;
  }

  close(cb) {
    checkCallback(cb);

    const peripherals = this._peripherals.filter(peripheral => {
      return peripheral !== undefined;
    });

    const closePeripheral = _ => {
      if (peripherals.length === 0) {
        return setImmediate(cb, null);
      }

      fs.close(peripherals.pop(), err => {
        if (err) {
          return cb(err);
        }
        closePeripheral();
      });
    };

    closePeripheral();
  }

  closeSync() {
    this._peripherals.forEach(peripheral => {
      if (peripheral !== undefined) {
        fs.closeSync(peripheral);
      }
    });

    this._peripherals = [];
  }

  i2cFuncs(cb) {
    checkCallback(cb);

    if (!this.funcs) {
      peripheral(this, 0, (err, device) => {
        if (err) {
          return cb(err);
        }

        i2c.i2cFuncsAsync(device, (err, i2cFuncBits) => {
          if (err) {
            return cb(err);
          }
          this.funcs = Object.freeze(new I2cFuncs(i2cFuncBits));
          cb(null, this.funcs);
        });
      });
    } else {
      setImmediate(cb, null, this.funcs);
    }
  }

  i2cFuncsSync() {
    if (!this.funcs) {
      this.funcs = Object.freeze(new I2cFuncs(i2c.i2cFuncsSync(peripheralSync(this, 0))));
    }

    return this.funcs;
  }

  readByte(addr, cmd, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.readByteAsync(device, cmd, cb);
    });
  }

  readByteSync(addr, cmd) {
    checkAddress(addr);
    checkCommand(cmd);

    return i2c.readByteSync(peripheralSync(this, addr), cmd);
  }

  readWord(addr, cmd, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.readWordAsync(device, cmd, cb);
    });
  }

  readWordSync(addr, cmd) {
    checkAddress(addr);
    checkCommand(cmd);

    return i2c.readWordSync(peripheralSync(this, addr), cmd);
  }

  // UNTESTED and undocumented due to lack of supporting hardware
  readBlock(addr, cmd, buffer, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBuffer(buffer);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.readBlockAsync(device, cmd, buffer, cb);
    });
  }

  // UNTESTED and undocumented due to lack of supporting hardware
  readBlockSync(addr, cmd, buffer) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBuffer(buffer);

    return i2c.readBlockSync(peripheralSync(this, addr), cmd, buffer);
  }

  readI2cBlock(addr, cmd, length, buffer, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBufferAndLength(length, buffer, 32);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.readI2cBlockAsync(device, cmd, length, buffer, cb);
    });
  }

  readI2cBlockSync(addr, cmd, length, buffer) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBufferAndLength(length, buffer, 32);

    return i2c.readI2cBlockSync(peripheralSync(this, addr), cmd, length, buffer);
  }

  receiveByte(addr, cb) {
    checkAddress(addr);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.receiveByteAsync(device, cb);
    });
  }

  receiveByteSync(addr) {
    checkAddress(addr);

    return i2c.receiveByteSync(peripheralSync(this, addr));
  }

  sendByte(addr, byte, cb) {
    checkAddress(addr);
    checkByte(byte);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.sendByteAsync(device, byte, cb);
    });
  }

  sendByteSync(addr, byte) {
    checkAddress(addr);
    checkByte(byte);

    i2c.sendByteSync(peripheralSync(this, addr), byte);

    return this;
  }

  writeByte(addr, cmd, byte, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkByte(byte);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.writeByteAsync(device, cmd, byte, cb);
    });
  }

  writeByteSync(addr, cmd, byte) {
    checkAddress(addr);
    checkCommand(cmd);
    checkByte(byte);

    i2c.writeByteSync(peripheralSync(this, addr), cmd, byte);

    return this;
  }

  writeWord(addr, cmd, word, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkWord(word);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.writeWordAsync(device, cmd, word, cb);
    });
  }

  writeWordSync(addr, cmd, word) {
    checkAddress(addr);
    checkCommand(cmd);
    checkWord(word);

    i2c.writeWordSync(peripheralSync(this, addr), cmd, word);

    return this;
  }

  writeQuick(addr, bit, cb) {
    checkAddress(addr);
    checkBit(bit);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.writeQuickAsync(device, bit, cb);
    });
  }

  writeQuickSync(addr, bit) {
    checkAddress(addr);
    checkBit(bit);

    i2c.writeQuickSync(peripheralSync(this, addr), bit);

    return this;
  }

  // UNTESTED and undocumented due to lack of supporting hardware
  writeBlock(addr, cmd, length, buffer, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBufferAndLength(length, buffer);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.writeBlockAsync(device, cmd, length, buffer, cb);
    });
  }

  // UNTESTED and undocumented due to lack of supporting hardware
  writeBlockSync(addr, cmd, length, buffer) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBufferAndLength(length, buffer);

    i2c.writeBlockSync(peripheralSync(this, addr), cmd, length, buffer);

    return this;
  }

  writeI2cBlock(addr, cmd, length, buffer, cb) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBufferAndLength(length, buffer, 32);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.writeI2cBlockAsync(device, cmd, length, buffer, cb);
    });
  }

  writeI2cBlockSync(addr, cmd, length, buffer) {
    checkAddress(addr);
    checkCommand(cmd);
    checkBufferAndLength(length, buffer, 32);

    i2c.writeI2cBlockSync(peripheralSync(this, addr), cmd, length, buffer);

    return this;
  }

  i2cRead(addr, length, buffer, cb) {
    checkAddress(addr);
    checkBufferAndLength(length, buffer);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      fs.read(device, buffer, 0, length, 0, cb);
    });
  }

  i2cReadSync(addr, length, buffer) {
    checkAddress(addr);
    checkBufferAndLength(length, buffer);

    return fs.readSync(peripheralSync(this, addr), buffer, 0, length, 0);
  }

  i2cWrite(addr, length, buffer, cb) {
    checkAddress(addr);
    checkBufferAndLength(length, buffer);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      fs.write(device, buffer, 0, length, 0, cb);
    });
  }

  i2cWriteSync(addr, length, buffer) {
    checkAddress(addr);
    checkBufferAndLength(length, buffer);

    return fs.writeSync(peripheralSync(this, addr), buffer, 0, length, 0);
  }

  scan(startAddr, endAddr, cb) {
    if (typeof startAddr === 'function') {
      cb = startAddr;
      startAddr = FIRST_SCAN_ADDR;
      endAddr = LAST_SCAN_ADDR;
    } else if (typeof endAddr === 'function') {
      cb = endAddr;
      endAddr = startAddr;
    }

    checkCallback(cb);
    checkAddress(startAddr);
    checkAddress(endAddr);

    const scanBus = open(this._busNumber, {forceAccess: this._forceAccess}, err => {
      const addresses = [];
      if (err) {
        return cb(err);
      }

      const next = addr => {
        if (addr > endAddr) {
          return scanBus.close(err => {
            if (err) {
              return cb(err);
            }
            cb(null, addresses);
          });
        }

        scanBus.receiveByte(addr, err => {
          if (!err) {
            addresses.push(addr);
          }

          next(addr + 1);
        });
      };

      next(startAddr);
    });
  }

  scanSync(startAddr, endAddr) {
    if (typeof startAddr === 'undefined') {
      startAddr = FIRST_SCAN_ADDR;
      endAddr = LAST_SCAN_ADDR;
    } else if (typeof endAddr === 'undefined') {
      endAddr = startAddr;
    }

    checkAddress(startAddr);
    checkAddress(endAddr);

    const scanBus = openSync(this._busNumber, {forceAccess: this._forceAccess});
    const addresses = [];

    for (let addr = startAddr; addr <= endAddr; addr += 1) {
      try {
        scanBus.receiveByteSync(addr);
        addresses.push(addr);
      } catch (ignore) {
      }
    }

    scanBus.closeSync();

    return addresses;
  }

  deviceId(addr, cb) {
    checkAddress(addr);
    checkCallback(cb);

    peripheral(this, addr, (err, device) => {
      if (err) {
        return cb(err);
      }

      i2c.deviceIdAsync(device, addr, (err, id) => {
        if (err) {
          return cb(err);
        }

        cb(null, parseId(id));
      });
    });
  }

  deviceIdSync(addr) {
    checkAddress(addr);

    const mp = i2c.deviceIdSync(peripheralSync(this, addr), addr);

    return parseId(mp);
  }
}

class PromisifiedBus {
  constructor(bus) {
    this._bus = bus;
  }

  bus() {
    return this._bus;
  }

  close() {
    return new Promise((resolve, reject) =>
      this._bus.close(err => err ? reject(err) : resolve())
    );
  }

  i2cFuncs() {
    return new Promise((resolve, reject) =>
      this._bus.i2cFuncs((err, funcs) => err ? reject(err) : resolve(funcs))
    );
  }

  readByte(addr, cmd) {
    return new Promise((resolve, reject) =>
      this._bus.readByte(addr, cmd,
        (err, byte) => err ? reject(err) : resolve(byte)
      )
    );
  }

  readWord(addr, cmd) {
    return new Promise((resolve, reject) =>
      this._bus.readWord(addr, cmd,
        (err, word) => err ? reject(err) : resolve(word)
      )
    );
  }

  // UNTESTED and undocumented due to lack of supporting hardware
  readBlock(addr, cmd, buffer) {
    return new Promise((resolve, reject) =>
      this._bus.readBlock(addr, cmd, buffer,
        (err, bytesRead, buffer) =>
          err ? reject(err) : resolve({bytesRead: bytesRead, buffer: buffer})
      )
    );
  }

  readI2cBlock(addr, cmd, length, buffer) {
    return new Promise((resolve, reject) =>
      this._bus.readI2cBlock(addr, cmd, length, buffer,
        (err, bytesRead, buffer) =>
          err ? reject(err) : resolve({bytesRead: bytesRead, buffer: buffer})
      )
    );
  }

  receiveByte(addr) {
    return new Promise((resolve, reject) =>
      this._bus.receiveByte(addr,
        (err, byte) => err ? reject(err) : resolve(byte)
      )
    );
  }

  sendByte(addr, byte) {
    return new Promise((resolve, reject) =>
      this._bus.sendByte(addr, byte,
        err => err ? reject(err) : resolve()
      )
    );
  }

  writeByte(addr, cmd, byte) {
    return new Promise((resolve, reject) =>
      this._bus.writeByte(addr, cmd, byte,
        err => err ? reject(err) : resolve()
      )
    );
  }

  writeWord(addr, cmd, word) {
    return new Promise((resolve, reject) =>
      this._bus.writeWord(addr, cmd, word,
        err => err ? reject(err) : resolve()
      )
    );
  }

  writeQuick(addr, bit) {
    return new Promise((resolve, reject) =>
      this._bus.writeQuick(addr, bit,
        err => err ? reject(err) : resolve()
      )
    );
  }

  // UNTESTED and undocumented due to lack of supporting hardware
  writeBlock(addr, cmd, length, buffer) {
    return new Promise((resolve, reject) =>
      this._bus.writeBlock(addr, cmd, length, buffer,
        (err, bytesWritten, buffer) =>
          err ? reject(err) : resolve({bytesWritten: bytesWritten, buffer: buffer})
      )
    );
  }

  writeI2cBlock(addr, cmd, length, buffer) {
    return new Promise((resolve, reject) =>
      this._bus.writeI2cBlock(addr, cmd, length, buffer,
        (err, bytesWritten, buffer) =>
          err ? reject(err) : resolve({bytesWritten: bytesWritten, buffer: buffer})
      )
    );
  }

  i2cRead(addr, length, buffer) {
    return new Promise((resolve, reject) =>
      this._bus.i2cRead(addr, length, buffer,
        (err, bytesRead, buffer) =>
          err ? reject(err) : resolve({bytesRead: bytesRead, buffer: buffer})
      )
    );
  }

  i2cWrite(addr, length, buffer) {
    return new Promise((resolve, reject) =>
      this._bus.i2cWrite(addr, length, buffer,
        (err, bytesWritten, buffer) =>
          err ? reject(err) : resolve({bytesWritten: bytesWritten, buffer: buffer})
      )
    );
  }

  scan(...args) {
    return new Promise((resolve, reject) =>
      this._bus.scan(...args,
        (err, devices) => err ? reject(err) : resolve(devices)
      )
    );
  }

  deviceId(addr) {
    return new Promise((resolve, reject) =>
      this._bus.deviceId(addr, (err, id) => err ? reject(err) : resolve(id))
    );
  }
}

module.exports = {
  open: open,
  openSync: openSync,
  openPromisified: openPromisified
};


"use strict";
/*
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
*/
Object.defineProperty(exports, "__esModule", { value: true });
const i2c_bus_1 = require("i2c-bus");
const child_process_1 = require("child_process");
const raspi_peripheral_1 = require("raspi-peripheral");
const raspi_board_1 = require("raspi-board");
function checkAddress(address) {
    if (typeof address !== 'number' || address < 0 || address > 0x7f) {
        throw new Error(`Invalid I2C address ${address}. Valid addresses are 0 through 0x7f.`);
    }
}
function checkRegister(register) {
    if (register !== undefined &&
        (typeof register !== 'number' || register < 0 || register > 0xff)) {
        throw new Error(`Invalid I2C register ${register}. Valid registers are 0 through 0xff.`);
    }
}
function checkLength(length, hasRegister) {
    if (typeof length !== 'number' || length < 0 || (hasRegister && length > 32)) {
        // Enforce 32 byte length limit only for SMBus.
        throw new Error(`Invalid I2C length ${length}. Valid lengths are 0 through 32.`);
    }
}
function checkBuffer(buffer, hasRegister) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 0 || (hasRegister && buffer.length > 32)) {
        // Enforce 32 byte length limit only for SMBus.
        throw new Error(`Invalid I2C buffer. Valid lengths are 0 through 32.`);
    }
}
function checkByte(byte) {
    if (typeof byte !== 'number' || byte < 0 || byte > 0xff) {
        throw new Error(`Invalid I2C byte ${byte}. Valid values are 0 through 0xff.`);
    }
}
function checkWord(word) {
    if (typeof word !== 'number' || word < 0 || word > 0xffff) {
        throw new Error(`Invalid I2C word ${word}. Valid values are 0 through 0xffff.`);
    }
}
function checkCallback(cb) {
    if (typeof cb !== 'function') {
        throw new Error('Invalid I2C callback');
    }
}
function createReadBufferCallback(suppliedCallback) {
    return (err, resultOrBytesRead, result) => {
        if (suppliedCallback) {
            if (err) {
                suppliedCallback(err, null);
            }
            else if (typeof result !== 'undefined') {
                suppliedCallback(null, result);
            }
            else if (Buffer.isBuffer(resultOrBytesRead)) {
                suppliedCallback(null, resultOrBytesRead);
            }
        }
    };
}
function createReadNumberCallback(suppliedCallback) {
    return (err, result) => {
        if (suppliedCallback) {
            if (err) {
                suppliedCallback(err, null);
            }
            else if (typeof result !== 'undefined') {
                suppliedCallback(null, result);
            }
        }
    };
}
function createWriteCallback(suppliedCallback) {
    return (err) => {
        if (suppliedCallback) {
            suppliedCallback(err || null);
        }
    };
}
class I2C extends raspi_peripheral_1.Peripheral {
    constructor() {
        super(['SDA0', 'SCL0']);
        this._devices = [];
        child_process_1.execSync('modprobe i2c-dev');
    }
    destroy() {
        this._devices.forEach((device) => device.closeSync());
        this._devices = [];
        super.destroy();
    }
    read(address, registerOrLength, lengthOrCb, cb) {
        this.validateAlive();
        let length;
        let register;
        if (typeof cb === 'function' && typeof lengthOrCb === 'number') {
            length = lengthOrCb;
            register = registerOrLength;
        }
        else if (typeof lengthOrCb === 'function') {
            cb = lengthOrCb;
            length = registerOrLength;
            register = undefined;
        }
        else {
            throw new TypeError('Invalid I2C read arguments');
        }
        checkAddress(address);
        checkRegister(register);
        checkLength(length, !!register);
        checkCallback(cb);
        const buffer = new Buffer(length);
        if (register === undefined) {
            this._getDevice(address).i2cRead(address, length, buffer, createReadBufferCallback(cb));
        }
        else {
            this._getDevice(address).readI2cBlock(address, register, length, buffer, createReadBufferCallback(cb));
        }
    }
    readSync(address, registerOrLength, length) {
        this.validateAlive();
        let register;
        if (typeof length === 'undefined') {
            length = +registerOrLength;
        }
        else {
            register = registerOrLength;
            length = +length;
        }
        checkAddress(address);
        checkRegister(register);
        checkLength(length, !!register);
        const buffer = new Buffer(length);
        if (register === undefined) {
            this._getDevice(address).i2cReadSync(address, length, buffer);
        }
        else {
            this._getDevice(address).readI2cBlockSync(address, register, length, buffer);
        }
        return buffer;
    }
    readByte(address, registerOrCb, cb) {
        this.validateAlive();
        let register;
        if (typeof registerOrCb === 'function') {
            cb = registerOrCb;
            register = undefined;
        }
        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);
        if (register === undefined) {
            const buffer = new Buffer(1);
            this._getDevice(address).i2cRead(address, buffer.length, buffer, (err) => {
                if (err) {
                    if (cb) {
                        cb(err, null);
                    }
                }
                else if (cb) {
                    cb(null, buffer[0]);
                }
            });
        }
        else {
            this._getDevice(address).readByte(address, register, createReadNumberCallback(cb));
        }
    }
    readByteSync(address, register) {
        this.validateAlive();
        checkAddress(address);
        checkRegister(register);
        let byte;
        if (register === undefined) {
            const buffer = new Buffer(1);
            this._getDevice(address).i2cReadSync(address, buffer.length, buffer);
            byte = buffer[0];
        }
        else {
            byte = this._getDevice(address).readByteSync(address, register);
        }
        return byte;
    }
    readWord(address, registerOrCb, cb) {
        this.validateAlive();
        let register;
        if (typeof registerOrCb === 'function') {
            cb = registerOrCb;
        }
        else {
            register = registerOrCb;
        }
        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);
        if (register === undefined) {
            const buffer = new Buffer(2);
            this._getDevice(address).i2cRead(address, buffer.length, buffer, (err) => {
                if (cb) {
                    if (err) {
                        return cb(err, null);
                    }
                    cb(null, buffer.readUInt16LE(0));
                }
            });
        }
        else {
            this._getDevice(address).readWord(address, register, createReadNumberCallback(cb));
        }
    }
    readWordSync(address, register) {
        this.validateAlive();
        checkAddress(address);
        checkRegister(register);
        let byte;
        if (register === undefined) {
            const buffer = new Buffer(2);
            this._getDevice(address).i2cReadSync(address, buffer.length, buffer);
            byte = buffer.readUInt16LE(0);
        }
        else {
            byte = this._getDevice(address).readWordSync(address, register);
        }
        return byte;
    }
    write(address, registerOrBuffer, bufferOrCb, cb) {
        this.validateAlive();
        let buffer;
        let register;
        if (Buffer.isBuffer(registerOrBuffer)) {
            cb = bufferOrCb;
            buffer = registerOrBuffer;
            register = undefined;
        }
        else if (typeof registerOrBuffer === 'number' && Buffer.isBuffer(bufferOrCb)) {
            register = registerOrBuffer;
            buffer = bufferOrCb;
        }
        else {
            throw new TypeError('Invalid I2C write arguments');
        }
        checkAddress(address);
        checkRegister(register);
        checkBuffer(buffer, !!register);
        if (register === undefined) {
            this._getDevice(address).i2cWrite(address, buffer.length, buffer, createWriteCallback(cb));
        }
        else {
            this._getDevice(address).writeI2cBlock(address, register, buffer.length, buffer, createWriteCallback(cb));
        }
    }
    writeSync(address, registerOrBuffer, buffer) {
        this.validateAlive();
        let register;
        if (Buffer.isBuffer(registerOrBuffer)) {
            buffer = registerOrBuffer;
        }
        else {
            if (!buffer) {
                throw new Error('Invalid I2C write arguments');
            }
            register = registerOrBuffer;
        }
        checkAddress(address);
        checkRegister(register);
        checkBuffer(buffer, !!register);
        if (register === undefined) {
            this._getDevice(address).i2cWriteSync(address, buffer.length, buffer);
        }
        else {
            this._getDevice(address).writeI2cBlockSync(address, register, buffer.length, buffer);
        }
    }
    writeByte(address, registerOrByte, byteOrCb, cb) {
        this.validateAlive();
        let byte;
        let register;
        if (typeof byteOrCb === 'number') {
            byte = byteOrCb;
            register = registerOrByte;
        }
        else {
            cb = byteOrCb;
            byte = registerOrByte;
        }
        checkAddress(address);
        checkRegister(register);
        checkByte(byte);
        if (register === undefined) {
            this._getDevice(address).i2cWrite(address, 1, new Buffer([byte]), createWriteCallback(cb));
        }
        else {
            this._getDevice(address).writeByte(address, register, byte, createWriteCallback(cb));
        }
    }
    writeByteSync(address, registerOrByte, byte) {
        this.validateAlive();
        let register;
        if (byte === undefined) {
            byte = registerOrByte;
        }
        else {
            register = registerOrByte;
        }
        checkAddress(address);
        checkRegister(register);
        checkByte(byte);
        if (register === undefined) {
            this._getDevice(address).i2cWriteSync(address, 1, new Buffer([byte]));
        }
        else {
            this._getDevice(address).writeByteSync(address, register, byte);
        }
    }
    writeWord(address, registerOrWord, wordOrCb, cb) {
        this.validateAlive();
        let register;
        let word;
        if (typeof wordOrCb === 'number') {
            register = registerOrWord;
            word = wordOrCb;
        }
        else if (typeof wordOrCb === 'function') {
            word = registerOrWord;
            cb = wordOrCb;
        }
        else {
            throw new Error('Invalid I2C write arguments');
        }
        checkAddress(address);
        checkRegister(register);
        checkWord(word);
        if (register === undefined) {
            const buffer = new Buffer(2);
            buffer.writeUInt16LE(word, 0);
            this._getDevice(address).i2cWrite(address, buffer.length, buffer, createWriteCallback(cb));
        }
        else {
            this._getDevice(address).writeWord(address, register, word, createWriteCallback(cb));
        }
    }
    writeWordSync(address, registerOrWord, word) {
        this.validateAlive();
        let register;
        if (word === undefined) {
            word = registerOrWord;
        }
        else {
            register = registerOrWord;
        }
        checkAddress(address);
        checkRegister(register);
        checkWord(word);
        if (register === undefined) {
            const buffer = new Buffer(2);
            buffer.writeUInt16LE(word, 0);
            this._getDevice(address).i2cWriteSync(address, buffer.length, buffer);
        }
        else {
            this._getDevice(address).writeWordSync(address, register, word);
        }
    }
    _getDevice(address) {
        let device = this._devices[address];
        if (device === undefined) {
            device = i2c_bus_1.openSync(raspi_board_1.getBoardRevision() === raspi_board_1.VERSION_1_MODEL_B_REV_1 ? 0 : 1);
            this._devices[address] = device;
        }
        return device;
    }
}
exports.I2C = I2C;
exports.module = {
    createI2C() {
        return new I2C();
    }
};
//# sourceMappingURL=index.js.map
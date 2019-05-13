"use strict";
/*
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
*/
Object.defineProperty(exports, "__esModule", { value: true });
const raspi_peripheral_1 = require("raspi-peripheral");
const SerialPort = require("serialport");
exports.PARITY_NONE = 'none';
exports.PARITY_EVEN = 'even';
exports.PARITY_ODD = 'odd';
exports.PARITY_MARK = 'mark';
exports.PARITY_SPACE = 'space';
exports.DEFAULT_PORT = '/dev/ttyAMA0';
function createEmptyCallback(cb) {
    return () => {
        if (cb) {
            cb();
        }
    };
}
function createErrorCallback(cb) {
    return (err) => {
        if (cb) {
            cb(err);
        }
    };
}
class Serial extends raspi_peripheral_1.Peripheral {
    constructor({ portId = exports.DEFAULT_PORT, baudRate = 9600, dataBits = 8, stopBits = 1, parity = exports.PARITY_NONE } = {}) {
        const pins = [];
        if (portId === exports.DEFAULT_PORT) {
            pins.push('TXD0', 'RXD0');
        }
        super(pins);
        this._portId = portId;
        this._options = {
            portId,
            baudRate,
            dataBits,
            stopBits,
            parity
        };
        this._isOpen = false;
        process.on('beforeExit', () => {
            this.destroy();
        });
    }
    get port() {
        return this._portId;
    }
    get baudRate() {
        return this._options.baudRate;
    }
    get dataBits() {
        return this._options.dataBits;
    }
    get stopBits() {
        return this._options.stopBits;
    }
    get parity() {
        return this._options.parity;
    }
    destroy() {
        this.close();
    }
    open(cb) {
        this.validateAlive();
        if (this._isOpen) {
            if (cb) {
                setImmediate(cb);
            }
            return;
        }
        this._portInstance = new SerialPort(this._portId, {
            lock: false,
            baudRate: this._options.baudRate,
            dataBits: this._options.dataBits,
            stopBits: this._options.stopBits,
            parity: this._options.parity
        });
        this._portInstance.on('open', () => {
            if (!this._portInstance) {
                throw new Error('Internal error: _portInstance undefined in "open" callback. ' +
                    'Please report this as a bug at https://github.com/nebrius/raspi-serial/issues.');
            }
            this._portInstance.on('data', (data) => {
                this.emit('data', data);
            });
            this._isOpen = true;
            if (cb) {
                cb();
            }
        });
    }
    close(cb) {
        this.validateAlive();
        if (!this._isOpen) {
            if (cb) {
                setImmediate(cb);
            }
            return;
        }
        this._isOpen = false;
        if (!this._portInstance) {
            throw new Error('Internal error: _portInstance undefined in "open" callback. ' +
                'Please report this as a bug at https://github.com/nebrius/raspi-serial/issues.');
        }
        this._portInstance.close(createErrorCallback(cb));
    }
    write(data, cb) {
        this.validateAlive();
        if (!this._isOpen) {
            throw new Error('Attempted to write to a closed serial port');
        }
        if (!this._portInstance) {
            throw new Error('Internal error: _portInstance undefined in "open" callback. ' +
                'Please report this as a bug at https://github.com/nebrius/raspi-serial/issues.');
        }
        this._portInstance.write(data, createEmptyCallback(cb));
    }
    flush(cb) {
        this.validateAlive();
        if (!this._isOpen) {
            throw new Error('Attempted to flush a closed serial port');
        }
        if (!this._portInstance) {
            throw new Error('Internal error: _portInstance undefined in "open" callback. ' +
                'Please report this as a bug at https://github.com/nebrius/raspi-serial/issues.');
        }
        this._portInstance.flush(createErrorCallback(cb));
    }
}
exports.Serial = Serial;
exports.module = {
    createSerial(options) {
        return new Serial(options);
    }
};
//# sourceMappingURL=index.js.map
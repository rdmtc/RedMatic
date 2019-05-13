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
const events_1 = require("events");
const raspi_board_1 = require("raspi-board");
const raspi_1 = require("raspi");
class Peripheral extends events_1.EventEmitter {
    constructor(pins) {
        super();
        this._alive = true;
        this._pins = [];
        if (!Array.isArray(pins)) {
            pins = [pins];
        }
        for (const alias of pins) {
            const pin = raspi_board_1.getPinNumber(alias);
            if (pin === null) {
                throw new Error(`Invalid pin: ${alias}`);
            }
            this._pins.push(pin);
            raspi_1.setActivePeripheral(pin, this);
        }
    }
    get alive() { return this._alive; }
    get pins() { return this._pins; }
    destroy() {
        if (this._alive) {
            this._alive = false;
            this.emit('destroyed');
        }
    }
    validateAlive() {
        if (!this._alive) {
            throw new Error('Attempted to access a destroyed peripheral');
        }
    }
}
exports.Peripheral = Peripheral;
//# sourceMappingURL=index.js.map
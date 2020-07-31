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
const fs_1 = require("fs");
const raspi_peripheral_1 = require("raspi-peripheral");
const hasLed = fs_1.existsSync('/sys/class/leds/led0') &&
    fs_1.existsSync('/sys/class/leds/led0/trigger') &&
    fs_1.existsSync('/sys/class/leds/led0/brightness');
exports.OFF = 0;
exports.ON = 1;
class LED extends raspi_peripheral_1.Peripheral {
    constructor() {
        super([]);
        if (hasLed) {
            fs_1.writeFileSync('/sys/class/leds/led0/trigger', 'none');
        }
    }
    hasLed() {
        return hasLed;
    }
    read() {
        if (hasLed) {
            return parseInt(fs_1.readFileSync('/sys/class/leds/led0/brightness').toString(), 10) ? exports.ON : exports.OFF;
        }
        return exports.OFF;
    }
    write(value) {
        this.validateAlive();
        if ([exports.ON, exports.OFF].indexOf(value) === -1) {
            throw new Error(`Invalid LED value ${value}`);
        }
        if (hasLed) {
            fs_1.writeFileSync('/sys/class/leds/led0/brightness', value ? '1' : '0');
        }
    }
}
exports.LED = LED;
exports.module = {
    createLED() {
        return new LED();
    }
};
//# sourceMappingURL=index.js.map
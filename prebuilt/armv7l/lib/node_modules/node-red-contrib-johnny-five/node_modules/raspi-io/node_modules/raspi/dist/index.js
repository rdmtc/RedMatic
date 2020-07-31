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
const raspi_board_1 = require("raspi-board");
if (!global.raspiPinUsage) {
    global.raspiPinUsage = {};
}
const registeredPins = global.raspiPinUsage;
// We used to do some stuff here back when we used Wiring Pi, but now that we
// use pigpio, there's nothing for us to do. We're keeping this module in place
// though because some other OSes may require this initialization, and we may
// even require it again someday in Raspbian.
function init(cb) {
    process.nextTick(cb);
}
exports.init = init;
function getActivePeripherals() {
    return registeredPins;
}
exports.getActivePeripherals = getActivePeripherals;
function getActivePeripheral(pin) {
    return registeredPins[pin];
}
exports.getActivePeripheral = getActivePeripheral;
function setActivePeripheral(pin, peripheral) {
    if (registeredPins[pin]) {
        registeredPins[pin].destroy();
        const peripheralPins = registeredPins[pin].pins;
        for (const peripheralPin of peripheralPins) {
            delete registeredPins[peripheralPin];
        }
    }
    registeredPins[pin] = peripheral;
}
exports.setActivePeripheral = setActivePeripheral;
function getPinNumber(alias) {
    return raspi_board_1.getPinNumber(alias);
}
exports.getPinNumber = getPinNumber;
exports.module = {
    init,
    getActivePeripherals,
    getActivePeripheral,
    setActivePeripheral,
    getPinNumber
};
//# sourceMappingURL=index.js.map
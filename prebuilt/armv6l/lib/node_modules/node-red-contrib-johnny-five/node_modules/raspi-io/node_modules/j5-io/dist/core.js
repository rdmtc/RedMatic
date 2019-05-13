"use strict";
/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the 'Software'), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
let baseModule = null;
const modeMapping = new WeakMap();
function createInternalErrorMessage(msg) {
    return `Internal Error: ${msg}. This is a bug, please file an issue at https://github.com/nebrius/core-io/issues.`;
}
exports.createInternalErrorMessage = createInternalErrorMessage;
function setBaseModule(module) {
    baseModule = module;
}
exports.setBaseModule = setBaseModule;
function getPeripheral(pin) {
    if (!baseModule) {
        throw new Error(createInternalErrorMessage(`"getPeripheral" method called without base module being set`));
    }
    return baseModule.getActivePeripheral(pin);
}
exports.getPeripheral = getPeripheral;
function getPeripherals() {
    if (!baseModule) {
        throw new Error(createInternalErrorMessage(`"getPeripherals" method called without base module being set`));
    }
    return baseModule.getActivePeripherals();
}
exports.getPeripherals = getPeripherals;
function getMode(peripheral) {
    const mode = modeMapping.get(peripheral);
    if (typeof mode !== 'number') {
        throw new Error(createInternalErrorMessage(`tried to get the mode for an unknown peripheral`));
    }
    return mode;
}
exports.getMode = getMode;
function setMode(peripheral, mode) {
    modeMapping.set(peripheral, mode);
}
exports.setMode = setMode;
function normalizePin(pin) {
    if (!baseModule) {
        throw new Error(createInternalErrorMessage(`"normalizePin" method called without base module being set`));
    }
    const normalizedPin = baseModule.getPinNumber(pin);
    if (typeof normalizedPin !== 'number') {
        throw new Error(`Unknown pin "${pin}"`);
    }
    return normalizedPin;
}
exports.normalizePin = normalizePin;
function constrain(value, min, max) {
    return value > max ? max : value < min ? min : value;
}
exports.constrain = constrain;
//# sourceMappingURL=core.js.map
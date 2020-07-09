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
const abstract_io_1 = require("abstract-io");
const core_1 = require("../core");
const READ_UPDATE_RATE = 18;
class GPIOManager {
    constructor(gpioModule, globalEventEmitter) {
        this.intervals = [];
        this.module = gpioModule;
        this.eventEmitter = globalEventEmitter;
    }
    reset() {
        this.intervals.forEach(clearInterval);
    }
    setInputMode(pin, pullResistor = this.module.PULL_NONE) {
        core_1.setMode(this.module.createDigitalInput({ pin, pullResistor }), abstract_io_1.Mode.INPUT);
    }
    setOutputMode(pin) {
        core_1.setMode(this.module.createDigitalOutput(pin), abstract_io_1.Mode.OUTPUT);
    }
    digitalWrite(pin, value) {
        const peripheral = core_1.getPeripheral(pin);
        if (peripheral) {
            const currentMode = core_1.getMode(peripheral);
            // Note: if we are in input mode, digitalWrite sets the pull resistor value
            // instead of changing to output mode and writing the value.
            if (currentMode === abstract_io_1.Mode.INPUT) {
                const newPullResistor = value ? this.module.PULL_UP : this.module.PULL_DOWN;
                if (peripheral.pullResistor !== newPullResistor) {
                    this.setInputMode(pin, newPullResistor);
                }
                return;
            }
            else if (currentMode !== abstract_io_1.Mode.OUTPUT) {
                this.setOutputMode(pin);
            }
        }
        // Need to refetch the peripheral in case it was reinstantiated in the above logic
        core_1.getPeripheral(pin).write(value);
    }
    digitalRead(pin, handler) {
        const peripheral = core_1.getPeripheral(pin);
        if (!peripheral || core_1.getMode(peripheral) !== abstract_io_1.Mode.INPUT) {
            this.setInputMode(pin);
        }
        let previousValue = -1;
        const interval = setInterval(() => {
            const currentPeripheral = core_1.getPeripheral(pin);
            if (!currentPeripheral) {
                clearInterval(interval);
                return;
            }
            switch (core_1.getMode(currentPeripheral)) {
                // Note: although we can only initiate this method in INPUT mode, we are supposed to continue
                // reporting values even if it's changed to OUTPUT mode
                case abstract_io_1.Mode.INPUT:
                case abstract_io_1.Mode.OUTPUT:
                    const value = currentPeripheral.value;
                    if (value !== previousValue) {
                        previousValue = value;
                        this.eventEmitter.emit(`digital-read-${pin}`, value);
                        handler(value);
                    }
                    break;
                default:
                    clearInterval(interval);
            }
        }, READ_UPDATE_RATE);
        this.intervals.push(interval);
    }
}
exports.GPIOManager = GPIOManager;
//# sourceMappingURL=gpio.js.map
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
const DEFAULT_SERVO_MIN = 1000;
const DEFAULT_SERVO_MAX = 2000;
class PWMManager {
    constructor(pwmModule) {
        this.ranges = {};
        this.module = pwmModule;
    }
    reset() {
        this.ranges = {};
    }
    setServoMode(pin, frequency, range) {
        if (!this.ranges[pin]) {
            this.ranges[pin] = { min: DEFAULT_SERVO_MIN, max: DEFAULT_SERVO_MAX };
        }
        core_1.setMode(this.module.createPWM(pin), abstract_io_1.Mode.SERVO);
    }
    setPWMMode(pin) {
        core_1.setMode(this.module.createPWM(pin), abstract_io_1.Mode.PWM);
    }
    pwmWrite(pin, dutyCycle) {
        const peripheral = core_1.getPeripheral(pin);
        if (!peripheral || core_1.getMode(peripheral) !== abstract_io_1.Mode.PWM) {
            this.setPWMMode(pin);
        }
        // Need to refetch the peripheral in case it was reinstantiated in the above logic
        core_1.getPeripheral(pin).write(core_1.constrain(dutyCycle, 0, 255) / 255);
    }
    servoConfig(pin, min, max) {
        if (typeof min !== 'number') {
            min = DEFAULT_SERVO_MIN;
        }
        if (typeof max !== 'number') {
            max = DEFAULT_SERVO_MAX;
        }
        const peripheral = core_1.getPeripheral(pin);
        if (!peripheral || core_1.getMode(peripheral) !== abstract_io_1.Mode.SERVO) {
            this.setServoMode(pin);
        }
        this.ranges[pin] = { min, max };
    }
    servoWrite(pin, value) {
        let peripheral = core_1.getPeripheral(pin);
        if (!peripheral || core_1.getMode(peripheral) !== abstract_io_1.Mode.SERVO) {
            this.setServoMode(pin);
        }
        // Need to refetch the peripheral in case it was reinstantiated in the above logic
        peripheral = core_1.getPeripheral(pin);
        const period = 1000000 / peripheral.frequency; // in us
        const { min, max } = this.ranges[pin];
        let pulseWidth;
        if (value < 544) {
            pulseWidth = min + core_1.constrain(value, 0, 180) / 180 * (max - min);
        }
        else {
            pulseWidth = core_1.constrain(value, min, max);
        }
        peripheral.write(pulseWidth / period);
    }
}
exports.PWMManager = PWMManager;
//# sourceMappingURL=pwm.js.map
"use strict";
/*
The MIT License (MIT)

Copyright (c) Tiago Alves <tralves@gmail.com> and Bryan Hughes <bryan@nebri.us>

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
const pigpio_1 = require("pigpio");
const raspi_peripheral_1 = require("raspi-peripheral");
const raspi_board_1 = require("raspi-board");
const DEFAULT_FREQUENCY = 50;
const DEFAULT_RANGE = 40000;
// Tell it to use the PWM clock for timing so that I2S still works. This does mean we can't use hardare PWM though.
pigpio_1.configureClock(5, pigpio_1.CLOCK_PWM);
class SoftPWM extends raspi_peripheral_1.Peripheral {
    get frequency() {
        return this._frequency;
    }
    get range() {
        return this._range;
    }
    get dutyCycle() {
        return this._dutyCycle;
    }
    constructor(config) {
        let pin;
        let frequency = DEFAULT_FREQUENCY;
        let range = DEFAULT_RANGE;
        if (typeof config === 'number' || typeof config === 'string') {
            pin = config;
        }
        else if (typeof config === 'object') {
            if (typeof config.pin === 'number' || typeof config.pin === 'string') {
                pin = config.pin;
            }
            else {
                throw new Error(`Invalid pin "${config.pin}". Pin must a number or string`);
            }
            if (typeof config.frequency === 'number') {
                frequency = config.frequency;
            }
            if (typeof config.range === 'number') {
                range = config.range;
            }
        }
        else {
            throw new Error('Invalid config, must be a number, string, or object');
        }
        super(pin);
        const gpioPin = raspi_board_1.getGpioNumber(pin);
        if (gpioPin === null) {
            throw new Error(`Internal error: ${pin} was parsed as a valid pin, but couldn't be resolved to a GPIO pin`);
        }
        this._frequency = frequency;
        this._range = range;
        this._dutyCycle = 0;
        this._pwm = new pigpio_1.Gpio(gpioPin, { mode: pigpio_1.Gpio.OUTPUT });
        this._pwm.pwmFrequency(frequency);
        this._pwm.pwmRange(range);
    }
    write(dutyCycle) {
        if (!this.alive) {
            throw new Error('Attempted to write to a destroyed peripheral');
        }
        if (typeof dutyCycle !== 'number' || dutyCycle < 0 || dutyCycle > 1) {
            throw new Error(`Invalid PWM duty cycle "${dutyCycle}"`);
        }
        this._dutyCycle = dutyCycle;
        this._pwm.pwmWrite(Math.round(this._dutyCycle * this._range));
    }
}
exports.SoftPWM = SoftPWM;
exports.module = {
    createPWM(config) {
        return new SoftPWM(config);
    }
};
//# sourceMappingURL=index.js.map
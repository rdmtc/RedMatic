"use strict";
/*
MIT License

Copyright (c) 2018 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
var Mode;
(function (Mode) {
    Mode[Mode["INPUT"] = 0] = "INPUT";
    Mode[Mode["OUTPUT"] = 1] = "OUTPUT";
    Mode[Mode["ANALOG"] = 2] = "ANALOG";
    Mode[Mode["PWM"] = 3] = "PWM";
    Mode[Mode["SERVO"] = 4] = "SERVO";
    Mode[Mode["STEPPER"] = 5] = "STEPPER";
    Mode[Mode["UNKNOWN"] = 99] = "UNKNOWN";
})(Mode = exports.Mode || (exports.Mode = {}));
var Value;
(function (Value) {
    Value[Value["HIGH"] = 1] = "HIGH";
    Value[Value["LOW"] = 0] = "LOW";
})(Value = exports.Value || (exports.Value = {}));
var StepperType;
(function (StepperType) {
    StepperType[StepperType["DRIVER"] = 1] = "DRIVER";
    StepperType[StepperType["TWO_WIRE"] = 2] = "TWO_WIRE";
    StepperType[StepperType["THREE_WIRE"] = 3] = "THREE_WIRE";
    StepperType[StepperType["FOUR_WIRE"] = 4] = "FOUR_WIRE";
})(StepperType = exports.StepperType || (exports.StepperType = {}));
var StepperStepSize;
(function (StepperStepSize) {
    StepperStepSize[StepperStepSize["WHOLE"] = 0] = "WHOLE";
    StepperStepSize[StepperStepSize["HALF"] = 1] = "HALF";
})(StepperStepSize = exports.StepperStepSize || (exports.StepperStepSize = {}));
var StepperDirection;
(function (StepperDirection) {
    StepperDirection[StepperDirection["CCW"] = 0] = "CCW";
    StepperDirection[StepperDirection["CW"] = 1] = "CW";
})(StepperDirection = exports.StepperDirection || (exports.StepperDirection = {}));
class AbstractIO extends events_1.EventEmitter {
    get MODES() {
        return Object.freeze({
            INPUT: Mode.INPUT,
            OUTPUT: Mode.OUTPUT,
            ANALOG: Mode.ANALOG,
            PWM: Mode.PWM,
            SERVO: Mode.SERVO,
            UNKNOWN: Mode.UNKNOWN
        });
    }
    get HIGH() {
        return Value.HIGH;
    }
    get LOW() {
        return Value.LOW;
    }
    get pins() {
        throw new Error(`The "pins" property must be overridden by a derived IO Plugin class`);
    }
    get analogPins() {
        throw new Error(`The "analogPins" property must be overridden by a derived IO Plugin class`);
    }
    get name() {
        throw new Error(`The "name" property must be overridden by a derived IO Plugin class`);
    }
    get defaultLed() {
        return undefined;
    }
    get isReady() {
        throw new Error(`The "isReady" property must be overridden by a derived IO Plugin class`);
    }
    get SERIAL_PORT_IDs() {
        throw new Error(`The "SERIAL_PORT_IDs" property must be overridden by a derived IO Plugin class`);
    }
    pinMode(pin, mode) {
        throw new Error(`The "pinMode" method must be overridden by a derived IO Plugin class`);
    }
    // Writing methods
    pwmWrite(pin, value) {
        throw new Error(`pwmWrite is not supported by ${this.name}`);
    }
    servoWrite(pin, value) {
        throw new Error(`servoWrite is not supported by ${this.name}`);
    }
    digitalWrite(pin, value) {
        throw new Error(`digitalWrite is not supported by ${this.name}`);
    }
    flushDigitalPorts() {
        throw new Error(`flushDigitalPorts is not supported by ${this.name}`);
    }
    i2cWrite(address, registerOrInBytes, inBytes) {
        throw new Error(`i2cWrite is not supported by ${this.name}`);
    }
    i2cWriteReg(address, register, value) {
        throw new Error(`i2cWriteReg is not supported by ${this.name}`);
    }
    serialWrite(portId, inBytes) {
        throw new Error(`serialWrite is not supported by ${this.name}`);
    }
    // Reading methods
    analogRead(pin, handler) {
        throw new Error(`analogRead is not supported by ${this.name}`);
    }
    digitalRead(pin, handler) {
        throw new Error(`digitalRead is not supported by ${this.name}`);
    }
    i2cRead(address, registerOrBytesToRead, bytesToReadOrHandler, handler) {
        throw new Error(`i2cRead is not supported by ${this.name}`);
    }
    i2cReadOnce(address, registerOrBytesToRead, bytesToReadOrHandler, handler) {
        throw new Error(`i2cReadOnce is not supported by ${this.name}`);
    }
    pingRead(settings, handler) {
        throw new Error(`pingRead is not supported by ${this.name}`);
    }
    serialRead(portId, maxBytesToReadOrHandler, handler) {
        throw new Error(`serialRead is not supported by ${this.name}`);
    }
    // Configuring
    i2cConfig(options) {
        throw new Error(`i2cConfig is not supported by ${this.name}`);
    }
    serialConfig(options) {
        throw new Error(`serialConfig is not supported by ${this.name}`);
    }
    servoConfig(optionsOrPin, min, max) {
        throw new Error(`servoConfig is not supported by ${this.name}`);
    }
    // IO Control
    serialStop(portId) {
        throw new Error(`serialStop is not supported by ${this.name}`);
    }
    serialClose(portId) {
        throw new Error(`serialClose is not supported by ${this.name}`);
    }
    serialFlush(portId) {
        throw new Error(`serialFlush is not supported by ${this.name}`);
    }
    // Special
    normalize(pin) {
        throw new Error(`normalize is not supported by ${this.name}`);
    }
    // Miscellaneous methods that are not currently documented, see https://github.com/rwaldron/io-plugins/issues/22
    // Special
    setSamplingInterval(interval) {
        throw new Error(`setSamplingInterval is not supported by ${this.name}`);
    }
    // One Wire
    sendOneWireConfig(pin, enableParasiticPower) {
        throw new Error(`sendOneWireConfig is not supported by ${this.name}`);
    }
    sendOneWireSearch(pin, cb) {
        throw new Error(`sendOneWireSearch is not supported by ${this.name}`);
    }
    sendOneWireAlarmsSearch(pin, cb) {
        throw new Error(`sendOneWireAlarmsSearch is not supported by ${this.name}`);
    }
    sendOneWireRead(pin, device, numBytesToRead, callback) {
        throw new Error(`sendOneWireRead is not supported by ${this.name}`);
    }
    sendOneWireReset(pin) {
        throw new Error(`sendOneWireReset is not supported by ${this.name}`);
    }
    sendOneWireWrite(pin, device, data) {
        throw new Error(`sendOneWireWrite is not supported by ${this.name}`);
    }
    sendOneWireDelay(pin, delay) {
        throw new Error(`sendOneWireDelay is not supported by ${this.name}`);
    }
    sendOneWireWriteAndRead(pin, device, data, numBytesToRead, callback) {
        throw new Error(`sendOneWireWriteAndRead is not supported by ${this.name}`);
    }
    // Stepper
    stepperConfig(deviceNum, type, stepsPerRev, dirOrMotor1Pin, dirOrMotor2Pin, motorPin3, motorPin4) {
        throw new Error(`stepperConfig is not supported by ${this.name}`);
    }
    stepperStep(deviceNum, direction, steps, speed, accelOrCallback, decel, callback) {
        throw new Error(`stepperStep is not supported by ${this.name}`);
    }
    // Accel Stepper
    accelStepperConfig(config) {
        throw new Error(`accelStepperConfig is not supported by ${this.name}`);
    }
    accelStepperZero(deviceNum) {
        throw new Error(`accelStepperZero is not supported by ${this.name}`);
    }
    accelStepperStep(deviceNum, steps, callback) {
        throw new Error(`accelStepperStep is not supported by ${this.name}`);
    }
    accelStepperTo(deviceNum, position, callback) {
        throw new Error(`accelStepperTo is not supported by ${this.name}`);
    }
    accelStepperEnable(deviceNum, enabled) {
        throw new Error(`accelStepperEnable is not supported by ${this.name}`);
    }
    accelStepperStop(deviceNum) {
        throw new Error(`accelStepperStop is not supported by ${this.name}`);
    }
    accelStepperReportPosition(deviceNum) {
        throw new Error(`accelStepperReportPosition is not supported by ${this.name}`);
    }
    accelStepperSpeed(deviceNum, speed) {
        throw new Error(`accelStepperSpeed is not supported by ${this.name}`);
    }
    accelStepperAcceleration(deviceNum, acceleration) {
        throw new Error(`accelStepperAcceleration is not supported by ${this.name}`);
    }
    // Multi Stepper
    multiStepperConfig(config) {
        throw new Error(`multiStepperConfig is not supported by ${this.name}`);
    }
    multiStepperTo(groupNum, positions, callback) {
        throw new Error(`multiStepperTo is not supported by ${this.name}`);
    }
    multiStepperStop(groupNum) {
        throw new Error(`multiStepperStop is not supported by ${this.name}`);
    }
    // Deprecated aliases and firmata.js compatibility functions that IO plugins don't need to worry about
    analogWrite(pin, value) {
        this.pwmWrite(pin, value);
    }
    sendI2CConfig(options) {
        return this.i2cConfig(options);
    }
    sendI2CWriteRequest(address, registerOrInBytes, inBytes) {
        return this.i2cWrite(address, registerOrInBytes, inBytes);
    }
    sendI2CReadRequest(address, registerOrBytesToRead, bytesToReadOrHandler, handler) {
        return this.i2cReadOnce(address, registerOrBytesToRead, bytesToReadOrHandler, handler);
    }
    reset() {
        throw new Error(`reset is not supported by ${this.name}`);
    }
    reportAnalogPin() {
        throw new Error(`reportAnalogPin is not supported by ${this.name}`);
    }
    reportDigitalPin() {
        throw new Error(`reportDigitalPin is not supported by ${this.name}`);
    }
    pulseIn() {
        throw new Error(`pulseIn is not supported by ${this.name}`);
    }
    queryCapabilities(cb) {
        if (this.isReady) {
            process.nextTick(cb);
        }
        else {
            this.on('ready', cb);
        }
    }
    queryAnalogMapping(cb) {
        if (this.isReady) {
            process.nextTick(cb);
        }
        else {
            this.on('ready', cb);
        }
    }
    queryPinState(pin, cb) {
        if (this.isReady) {
            process.nextTick(cb);
        }
        else {
            this.on('ready', cb);
        }
    }
}
exports.AbstractIO = AbstractIO;
//# sourceMappingURL=index.js.map
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const j5_io_types_1 = require("j5-io-types");
const abstract_io_1 = require("abstract-io");
const core_1 = require("./core");
const gpio_1 = require("./managers/gpio");
const pwm_1 = require("./managers/pwm");
const led_1 = require("./managers/led");
const serial_1 = require("./managers/serial");
const i2c_1 = require("./managers/i2c");
// Private symbols for public getters
const serialPortIds = Symbol('serialPortIds');
const i2cPortIds = Symbol('i2cPortIds');
const name = Symbol('name');
const isReady = Symbol('isReady');
const pins = Symbol('pins');
const defaultLed = Symbol('defaultLed');
// Private symbols for internal properties
const gpioManager = Symbol('gpioManager');
const pwmManager = Symbol('pwmManager');
const ledManager = Symbol('ledManager');
const serialManager = Symbol('serialManager');
const i2cManager = Symbol('i2cManager');
const swizzleI2CReadArguments = Symbol('swizzleI2CReadArguments');
class J5IO extends abstract_io_1.AbstractIO {
    constructor(options) {
        super();
        this[_a] = false;
        this[_b] = [];
        // Verify the options. It's not very thorough, but should be sufficient
        if (typeof options !== 'object') {
            throw new Error('"options" is required and must be an object');
        }
        if (typeof options.pluginName !== 'string') {
            throw new Error('"options.pluginName" is required and must be a string');
        }
        if (typeof options.pinInfo !== 'object') {
            throw new Error('"options.pinInfo" is required and must be an object');
        }
        if (typeof options.platform !== 'object') {
            throw new Error('"options.platform" is required and must be an object');
        }
        if (typeof options.platform.base !== 'object') {
            throw new Error('"options.platform.base" is required and must be an object');
        }
        if (typeof options.platform.gpio !== 'object') {
            throw new Error('"options.platform.gpio" is required and must be an object');
        }
        if (typeof options.platform.pwm !== 'object') {
            throw new Error('"options.platform.pwm" is required and must be an object');
        }
        if (typeof options.platform.serial === 'object') {
            if (typeof options.serialIds !== 'object') {
                throw new Error('"options.serialIds" is required and must be an object when options.platform.serial is also supplied');
            }
            if (typeof options.serialIds.DEFAULT === 'undefined') {
                throw new Error('"DEFAULT" serial ID is required in options.serialIds');
            }
        }
        if (typeof options.platform.i2c === 'object') {
            if (typeof options.i2cIds !== 'object') {
                throw new Error('"options.i2cIds" is required and must be an object when options.platform.i2c is also supplied');
            }
            if (typeof options.i2cIds.DEFAULT === 'undefined') {
                throw new Error('"DEFAULT" I2C ID is required in options.i2cIds');
            }
        }
        // Create the plugin name
        this[name] = options.pluginName;
        const { pinInfo, serialIds, i2cIds, platform } = options;
        // Create the serial port IDs if serial is supported
        if (serialIds) {
            this[serialPortIds] = Object.freeze(serialIds);
        }
        else {
            this[serialPortIds] = Object.freeze({});
        }
        // Create the I2C port IDs if I2C is supported
        if (i2cIds) {
            this[i2cPortIds] = Object.freeze(i2cIds);
        }
        else {
            this[i2cPortIds] = Object.freeze({});
        }
        // Instantiate the peripheral managers
        core_1.setBaseModule(platform.base);
        this[gpioManager] = new gpio_1.GPIOManager(platform.gpio, this);
        this[pwmManager] = new pwm_1.PWMManager(platform.pwm);
        if (platform.led) {
            this[defaultLed] = led_1.DEFAULT_LED_PIN;
            this[ledManager] = new led_1.LEDManager(platform.led);
        }
        if (platform.serial && serialIds) {
            this[serialManager] = new serial_1.SerialManager(platform.serial, serialIds, this);
        }
        if (platform.i2c && i2cIds) {
            this[i2cManager] = new i2c_1.I2CManager(platform.i2c, i2cIds, this);
        }
        // Inject the test only methods if we're in test mode
        if (process.env.RASPI_IO_TEST_MODE) {
            this.getInternalPinInstances = () => core_1.getPeripherals();
            this.getLEDInstance = () => this[ledManager] && this[ledManager].led;
            this.getI2CInstance = (portId) => this[i2cManager] && this[i2cManager].getI2CInstance(portId);
        }
        // Create the pins object
        this[pins] = [];
        const pinMappings = Object.assign({}, pinInfo);
        function createPinEntry(pin, pinMapping) {
            const supportedModes = [];
            // Serial and I2C are dedicated due to how the IO Plugin API works, so ignore all other supported peripheral types
            if (pinMapping.peripherals.indexOf(j5_io_types_1.PeripheralType.UART) !== -1) {
                supportedModes.push(abstract_io_1.Mode.UNKNOWN);
            }
            else if (pinMapping.peripherals.indexOf(j5_io_types_1.PeripheralType.I2C) !== -1) {
                supportedModes.push(abstract_io_1.Mode.UNKNOWN);
            }
            else {
                if (platform.led && pin === led_1.DEFAULT_LED_PIN) {
                    supportedModes.push(abstract_io_1.Mode.OUTPUT);
                }
                else if (pinMapping.peripherals.indexOf(j5_io_types_1.PeripheralType.GPIO) !== -1) {
                    supportedModes.push(abstract_io_1.Mode.INPUT, abstract_io_1.Mode.OUTPUT);
                }
                if (pinMapping.peripherals.indexOf(j5_io_types_1.PeripheralType.PWM) !== -1) {
                    supportedModes.push(abstract_io_1.Mode.PWM, abstract_io_1.Mode.SERVO);
                }
            }
            return Object.create(null, {
                supportedModes: {
                    enumerable: true,
                    value: Object.freeze(supportedModes)
                },
                mode: {
                    enumerable: true,
                    get() {
                        const peripheral = core_1.getPeripheral(pin);
                        if (!peripheral) {
                            return abstract_io_1.Mode.UNKNOWN;
                        }
                        return core_1.getMode(peripheral);
                    }
                },
                value: {
                    enumerable: true,
                    get() {
                        const peripheral = core_1.getPeripheral(pin);
                        if (!peripheral) {
                            return null;
                        }
                        switch (core_1.getMode(peripheral)) {
                            case abstract_io_1.Mode.INPUT:
                                return peripheral.value;
                            case abstract_io_1.Mode.OUTPUT:
                                return peripheral.value;
                            default:
                                return null;
                        }
                    },
                    set(value) {
                        const peripheral = core_1.getPeripheral(pin);
                        if (peripheral && core_1.getMode(peripheral) === abstract_io_1.Mode.OUTPUT) {
                            peripheral.write(value);
                        }
                    }
                },
                report: {
                    enumerable: true,
                    value: 1
                },
                analogChannel: {
                    enumerable: true,
                    value: 127
                }
            });
        }
        for (const pinKey in pinMappings) {
            if (!pinMappings.hasOwnProperty(pinKey)) {
                continue;
            }
            const pin = parseInt(pinKey, 10);
            this[pins][pin] = createPinEntry(pin, pinMappings[pin]);
            if (this.supportsMode(pin, abstract_io_1.Mode.OUTPUT)) {
                this.pinMode(pin, abstract_io_1.Mode.OUTPUT);
                this.digitalWrite(pin, abstract_io_1.Value.LOW);
            }
        }
        // Add the virtual LED pin, since it's not a real pin, but only if a built-in LED is provided
        if (platform.led) {
            this[pins][led_1.DEFAULT_LED_PIN] = Object.create(null, {
                supportedModes: {
                    enumerable: true,
                    value: Object.freeze([abstract_io_1.Mode.OUTPUT])
                },
                mode: {
                    enumerable: true,
                    get() {
                        return abstract_io_1.Mode.OUTPUT;
                    }
                },
                value: {
                    enumerable: true,
                    get() {
                        const ledManagerInstance = this[ledManager];
                        if (ledManagerInstance) {
                            return ledManagerInstance.getCurrentValue();
                        }
                        else {
                            return abstract_io_1.Value.LOW;
                        }
                    }
                },
                report: {
                    enumerable: true,
                    value: 1
                },
                analogChannel: {
                    enumerable: true,
                    value: 127
                }
            });
        }
        // Fill in the holes, sins pins are sparse on some platforms, e.g. on most Raspberry Pis
        for (let i = 0; i < this[pins].length; i++) {
            if (!this[pins][i]) {
                this[pins][i] = Object.create(null, {
                    supportedModes: {
                        enumerable: true,
                        value: Object.freeze([])
                    },
                    mode: {
                        enumerable: true,
                        get() {
                            return abstract_io_1.Mode.UNKNOWN;
                        }
                    },
                    value: {
                        enumerable: true,
                        get() {
                            return 0;
                        }
                    },
                    report: {
                        enumerable: true,
                        value: 1
                    },
                    analogChannel: {
                        enumerable: true,
                        value: 127
                    }
                });
            }
        }
        platform.base.init(() => {
            if (platform.serial) {
                this.serialConfig({
                    portId: this.SERIAL_PORT_IDs.DEFAULT,
                    baud: 9600
                });
            }
            this[isReady] = true;
            this.emit('ready');
            this.emit('connect');
        });
    }
    get defaultLed() {
        if (this[ledManager]) {
            return this[defaultLed];
        }
        else {
            throw new Error(`${this.name} does not have a default LED`);
        }
    }
    get name() {
        return this[name];
    }
    get SERIAL_PORT_IDs() {
        return this[serialPortIds];
    }
    get I2C_PORT_IDS() {
        return this[i2cPortIds];
    }
    get pins() {
        return Object.freeze(this[pins]);
    }
    get analogPins() {
        return Object.freeze([]);
    }
    get isReady() {
        return this[isReady];
    }
    reset() {
        // TODO: Loop through active peripherals and destroy them
        // TODO: add unit tests for resetting
        this[gpioManager].reset();
        this[pwmManager].reset();
        const ledManagerInstance = this[ledManager];
        if (ledManagerInstance) {
            ledManagerInstance.reset();
        }
        const serialManagerInstance = this[serialManager];
        if (serialManagerInstance) {
            serialManagerInstance.reset();
        }
    }
    normalize(pin) {
        // LED is a special thing that the underlying platform doesn't know about, and isn't actually a pin.
        // Gotta reroute it here, and we just have it return the pin that's passed in
        if (this[ledManager] && pin === led_1.DEFAULT_LED_PIN) {
            return led_1.DEFAULT_LED_PIN;
        }
        return core_1.normalizePin(pin);
    }
    pinMode(pin, mode) {
        const normalizedPin = this.normalize(pin);
        // Make sure that the requested pin mode is valid and supported by the pin in question
        if (!abstract_io_1.Mode.hasOwnProperty(mode)) {
            throw new Error(`Unknown mode ${mode}`);
        }
        this.validateSupportedMode(pin, mode);
        if (this[ledManager] && pin === led_1.DEFAULT_LED_PIN) {
            // Note: the LED module is a dedicated peripheral and can't be any other mode, so we can shortcut here
            return;
        }
        else {
            switch (mode) {
                case abstract_io_1.Mode.INPUT:
                    this[gpioManager].setInputMode(normalizedPin);
                    break;
                case abstract_io_1.Mode.OUTPUT:
                    this[gpioManager].setOutputMode(normalizedPin);
                    break;
                case abstract_io_1.Mode.PWM:
                    this[pwmManager].setPWMMode(normalizedPin);
                    break;
                case abstract_io_1.Mode.SERVO:
                    this[pwmManager].setServoMode(normalizedPin);
                    break;
                default:
                    throw new Error(core_1.createInternalErrorMessage(`valid pin mode ${mode} not accounted for in switch statement`));
            }
        }
    }
    // GPIO methods
    digitalRead(pin, handler) {
        this.validateSupportedMode(pin, abstract_io_1.Mode.INPUT);
        this[gpioManager].digitalRead(this.normalize(pin), handler);
    }
    digitalWrite(pin, value) {
        // Again, LED is a special thing that the underlying platform doesn't know about.
        // Gotta reroute it here to the appropriate peripheral manager
        const ledManagerInstance = this[ledManager];
        if (ledManagerInstance && pin === led_1.DEFAULT_LED_PIN) {
            ledManagerInstance.digitalWrite(value);
        }
        else {
            // Gotta double check output support here, because this method can change the pin
            // mode but doesn't have full access to everything this file does
            this.validateSupportedMode(pin, abstract_io_1.Mode.OUTPUT);
            this[gpioManager].digitalWrite(this.normalize(pin), value);
        }
    }
    // PWM methods
    pwmWrite(pin, value) {
        this[pwmManager].pwmWrite(this.normalize(pin), value);
    }
    servoWrite(pin, value) {
        this[pwmManager].servoWrite(this.normalize(pin), value);
    }
    servoConfig(optionsOrPin, min, max) {
        if (typeof optionsOrPin === 'number' || typeof optionsOrPin === 'string') {
            if (typeof min !== 'number') {
                throw new Error(`"min" must be a number`);
            }
            if (typeof max !== 'number') {
                throw new Error(`"max" must be a number`);
            }
        }
        else if (typeof optionsOrPin === 'object') {
            min = optionsOrPin.min;
            max = optionsOrPin.max;
            optionsOrPin = optionsOrPin.pin;
        }
        else {
            throw new Error('optionsOrPin must be a number, string, or object');
        }
        this[pwmManager].servoConfig(this.normalize(optionsOrPin), min, max);
    }
    // Serial Methods
    serialConfig(options) {
        const serialManagerInstance = this[serialManager];
        if (!serialManagerInstance) {
            throw new Error('Serial support is disabled');
        }
        serialManagerInstance.serialConfig(options);
    }
    serialWrite(portId, inBytes) {
        const serialManagerInstance = this[serialManager];
        if (!serialManagerInstance) {
            throw new Error('Serial support is disabled');
        }
        serialManagerInstance.serialWrite(portId, inBytes);
    }
    serialRead(portId, maxBytesToReadOrHandler, handler) {
        const serialManagerInstance = this[serialManager];
        if (!serialManagerInstance) {
            throw new Error('Serial support is disabled');
        }
        serialManagerInstance.serialRead(portId, maxBytesToReadOrHandler, handler);
    }
    serialStop(portId) {
        const serialManagerInstance = this[serialManager];
        if (!serialManagerInstance) {
            throw new Error('Serial support is disabled');
        }
        serialManagerInstance.serialStop(portId);
    }
    serialClose(portId) {
        const serialManagerInstance = this[serialManager];
        if (!serialManagerInstance) {
            throw new Error('Serial support is disabled');
        }
        serialManagerInstance.serialClose(portId);
    }
    serialFlush(portId) {
        const serialManagerInstance = this[serialManager];
        if (!serialManagerInstance) {
            throw new Error('Serial support is disabled');
        }
        serialManagerInstance.serialFlush(portId);
    }
    // I2C Methods
    i2cConfig(options) {
        // Do nothing because we don't currently support delay
    }
    i2cWrite(address, registerOrInBytes, byteOrInBytes) {
        const i2cManagerInstance = this[i2cManager];
        if (!i2cManagerInstance) {
            throw new Error('I2C support is disabled');
        }
        let value;
        let register;
        if (typeof registerOrInBytes === 'number' && Array.isArray(byteOrInBytes)) {
            register = registerOrInBytes;
            value = byteOrInBytes;
        }
        else if (typeof registerOrInBytes === 'number' && typeof byteOrInBytes === 'number') {
            register = registerOrInBytes;
            value = [byteOrInBytes];
        }
        else if (typeof registerOrInBytes === 'number' && typeof byteOrInBytes === 'undefined') {
            register = undefined;
            value = [registerOrInBytes];
        }
        else if (Array.isArray(registerOrInBytes)) {
            register = undefined;
            value = registerOrInBytes;
        }
        else {
            throw new Error('Invalid arguments');
        }
        // Skip the write if the buffer is empty
        if (value.length) {
            i2cManagerInstance.i2cWrite(this[i2cPortIds].DEFAULT, address, register, value);
        }
    }
    i2cWriteReg(address, register, value) {
        const i2cManagerInstance = this[i2cManager];
        if (!i2cManagerInstance) {
            throw new Error('I2C support is disabled');
        }
        i2cManagerInstance.i2cWrite(this[i2cPortIds].DEFAULT, address, register, value);
    }
    i2cRead(inAddress, registerOrBytesToRead, bytesToReadOrHandler, inHandler) {
        const i2cManagerInstance = this[i2cManager];
        if (!i2cManagerInstance) {
            throw new Error('I2C support is disabled');
        }
        const { address, register, bytesToRead, handler } = this[swizzleI2CReadArguments](inAddress, registerOrBytesToRead, bytesToReadOrHandler, inHandler);
        i2cManagerInstance.i2cRead(this[i2cPortIds].DEFAULT, true, address, register, bytesToRead, handler);
    }
    i2cReadOnce(inAddress, registerOrBytesToRead, bytesToReadOrHandler, inHandler) {
        const i2cManagerInstance = this[i2cManager];
        if (!i2cManagerInstance) {
            throw new Error('I2C support is disabled');
        }
        const { address, register, bytesToRead, handler } = this[swizzleI2CReadArguments](inAddress, registerOrBytesToRead, bytesToReadOrHandler, inHandler);
        i2cManagerInstance.i2cRead(this[i2cPortIds].DEFAULT, false, address, register, bytesToRead, handler);
    }
    [(_a = isReady, _b = pins, swizzleI2CReadArguments)](address, registerOrBytesToRead, bytesToReadOrHandler, handler) {
        let register;
        let bytesToRead;
        if (typeof handler === 'function' && typeof bytesToReadOrHandler === 'number') {
            register = registerOrBytesToRead;
            bytesToRead = bytesToReadOrHandler;
        }
        else if (typeof bytesToReadOrHandler === 'function' && typeof handler === 'undefined') {
            bytesToRead = registerOrBytesToRead;
            handler = bytesToReadOrHandler;
        }
        else {
            throw new Error('Invalid arguments');
        }
        if (typeof handler !== 'function') {
            handler = () => {
                // Do nothing
            };
        }
        return { address, register, bytesToRead, handler };
    }
    supportsMode(normalizedPin, mode) {
        return this[pins][normalizedPin].supportedModes.indexOf(mode) !== -1;
    }
    validateSupportedMode(pin, mode) {
        const normalizedPin = this.normalize(pin);
        if (!this.supportsMode(normalizedPin, mode)) {
            throw new Error(`Pin "${pin}" does not support mode "${abstract_io_1.Mode[mode].toLowerCase()}"`);
        }
    }
}
exports.J5IO = J5IO;
//# sourceMappingURL=index.js.map
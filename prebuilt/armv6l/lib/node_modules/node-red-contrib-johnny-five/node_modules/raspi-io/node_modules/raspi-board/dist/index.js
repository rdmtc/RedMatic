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
const fs_1 = require("fs");
const j5_io_types_1 = require("j5-io-types");
exports.VERSION_1_MODEL_A = 'rpi1_a';
exports.VERSION_1_MODEL_B_REV_1 = 'rpi1_b1';
exports.VERSION_1_MODEL_B_REV_2 = 'rpi1_b2';
exports.VERSION_1_MODEL_B_PLUS = 'rpi1_bplus';
exports.VERSION_1_MODEL_A_PLUS = 'rpi1_aplus';
exports.VERSION_1_MODEL_ZERO = 'rpi1_zero';
exports.VERSION_1_MODEL_ZERO_W = 'rpi1_zerow';
exports.VERSION_2_MODEL_B = 'rpi2_b';
exports.VERSION_3_MODEL_B = 'rpi3_b';
exports.VERSION_3_MODEL_B_PLUS = 'rpi3_bplus';
exports.VERSION_3_MODEL_A_PLUS = 'rpi3_aplus';
exports.VERSION_UNKNOWN = 'unknown';
const BOARD_REVISIONS = {
    '0002': exports.VERSION_1_MODEL_B_REV_1,
    '0003': exports.VERSION_1_MODEL_B_REV_1,
    '0004': exports.VERSION_1_MODEL_B_REV_2,
    '0005': exports.VERSION_1_MODEL_B_REV_2,
    '0006': exports.VERSION_1_MODEL_B_REV_2,
    '0007': exports.VERSION_1_MODEL_A,
    '0008': exports.VERSION_1_MODEL_A,
    '0009': exports.VERSION_1_MODEL_A,
    '000d': exports.VERSION_1_MODEL_B_REV_2,
    '000e': exports.VERSION_1_MODEL_B_REV_2,
    '000f': exports.VERSION_1_MODEL_B_REV_2,
    '0010': exports.VERSION_1_MODEL_B_PLUS,
    '0012': exports.VERSION_1_MODEL_A_PLUS,
    '0013': exports.VERSION_1_MODEL_B_PLUS,
    '0015': exports.VERSION_1_MODEL_A_PLUS,
    '900021': exports.VERSION_1_MODEL_A_PLUS,
    '900032': exports.VERSION_1_MODEL_B_PLUS,
    '900092': exports.VERSION_1_MODEL_ZERO,
    '920092': exports.VERSION_1_MODEL_ZERO,
    '900093': exports.VERSION_1_MODEL_ZERO,
    '920093': exports.VERSION_1_MODEL_ZERO,
    '9000c1': exports.VERSION_1_MODEL_ZERO_W,
    '19000c1': exports.VERSION_1_MODEL_ZERO_W,
    'a01040': exports.VERSION_2_MODEL_B,
    'a01041': exports.VERSION_2_MODEL_B,
    'a21041': exports.VERSION_2_MODEL_B,
    'a22042': exports.VERSION_2_MODEL_B,
    'a02082': exports.VERSION_3_MODEL_B,
    'a22082': exports.VERSION_3_MODEL_B,
    'a32082': exports.VERSION_3_MODEL_B,
    'a52082': exports.VERSION_3_MODEL_B,
    'a020d3': exports.VERSION_3_MODEL_B_PLUS,
    '9020e0': exports.VERSION_3_MODEL_A_PLUS
};
const B1 = {
    0: {
        pins: [
            'GPIO17',
            'P1-11'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 17
    },
    1: {
        pins: [
            'GPIO18',
            'PWM0',
            'P1-12'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.PWM
        ],
        gpio: 18
    },
    2: {
        pins: [
            'GPIO21',
            'P1-13'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 21
    },
    3: {
        pins: [
            'GPIO22',
            'P1-15'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 22
    },
    4: {
        pins: [
            'GPIO23',
            'P1-16'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 23
    },
    5: {
        pins: [
            'GPIO24',
            'P1-18'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 24
    },
    6: {
        pins: [
            'GPIO25',
            'P1-22'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 25
    },
    7: {
        pins: [
            'GPIO4',
            'P1-7'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 4
    },
    8: {
        pins: [
            'GPIO0',
            'SDA0',
            'P1-3'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.I2C
        ],
        gpio: 0
    },
    9: {
        pins: [
            'GPIO1',
            'SCL0',
            'P1-5'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.I2C
        ],
        gpio: 1
    },
    10: {
        pins: [
            'GPIO8',
            'P1-24',
            'CE0'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 8
    },
    11: {
        pins: [
            'GPIO7',
            'P1-26'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 7
    },
    12: {
        pins: [
            'GPIO10',
            'MOSI0',
            'P1-19'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 10
    },
    13: {
        pins: [
            'GPIO9',
            'MISO0',
            'P1-21'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 9
    },
    14: {
        pins: [
            'GPIO11',
            'SCLK0',
            'P1-23'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 11
    },
    15: {
        pins: [
            'GPIO14',
            'TXD0',
            'P1-8'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.UART
        ],
        gpio: 14
    },
    16: {
        pins: [
            'GPIO15',
            'RXD0',
            'P1-10'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.UART
        ],
        gpio: 15
    }
};
const B2 = {
    0: {
        pins: [
            'GPIO17',
            'P1-11'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 17
    },
    1: {
        pins: [
            'GPIO18',
            'PWM0',
            'P1-12'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.PWM
        ],
        gpio: 18
    },
    2: {
        pins: [
            'GPIO27',
            'P1-13'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 27
    },
    3: {
        pins: [
            'GPIO22',
            'P1-15'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 22
    },
    4: {
        pins: [
            'GPIO23',
            'P1-16'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 23
    },
    5: {
        pins: [
            'GPIO24',
            'P1-18'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 24
    },
    6: {
        pins: [
            'GPIO25',
            'P1-22'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 25
    },
    7: {
        pins: [
            'GPIO4',
            'P1-7'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 4
    },
    8: {
        pins: [
            'GPIO2',
            'SDA0',
            'P1-3'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.I2C
        ],
        gpio: 2
    },
    9: {
        pins: [
            'GPIO3',
            'SCL0',
            'P1-5'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.I2C
        ],
        gpio: 3
    },
    10: {
        pins: [
            'GPIO8',
            'CE0',
            'P1-24'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 8
    },
    11: {
        pins: [
            'GPIO7',
            'P1-26'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 7
    },
    12: {
        pins: [
            'GPIO10',
            'MOSI0',
            'P1-19'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 10
    },
    13: {
        pins: [
            'GPIO9',
            'MISO0',
            'P1-21'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 9
    },
    14: {
        pins: [
            'GPIO11',
            'SCLK0',
            'P1-23'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 11
    },
    15: {
        pins: [
            'GPIO14',
            'TXD0',
            'P1-8'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.UART
        ],
        gpio: 14
    },
    16: {
        pins: [
            'GPIO15',
            'RXD0',
            'P1-10'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.UART
        ],
        gpio: 15
    },
    17: {
        pins: [
            'GPIO28',
            'P5-3'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 28
    },
    18: {
        pins: [
            'GPIO29',
            'P5-4'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 29
    },
    19: {
        pins: [
            'GPIO30',
            'P5-5'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 30
    },
    20: {
        pins: [
            'GPIO31',
            'P5-6'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 31
    }
};
const BPLUS = {
    0: {
        pins: [
            'GPIO17',
            'P1-11'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 17
    },
    1: {
        pins: [
            'GPIO18',
            'PWM0',
            'P1-12'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.PWM
        ],
        gpio: 18
    },
    2: {
        pins: [
            'GPIO27',
            'P1-13'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 27
    },
    3: {
        pins: [
            'GPIO22',
            'P1-15'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 22
    },
    4: {
        pins: [
            'GPIO23',
            'P1-16'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 23
    },
    5: {
        pins: [
            'GPIO24',
            'P1-18'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 24
    },
    6: {
        pins: [
            'GPIO25',
            'P1-22'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 25
    },
    7: {
        pins: [
            'GPIO4',
            'P1-7'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 4
    },
    8: {
        pins: [
            'GPIO2',
            'SDA0',
            'P1-3'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.I2C
        ],
        gpio: 2
    },
    9: {
        pins: [
            'GPIO3',
            'SCL0',
            'P1-5'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.I2C
        ],
        gpio: 3
    },
    10: {
        pins: [
            'GPIO8',
            'CE0',
            'P1-24'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 8
    },
    11: {
        pins: [
            'GPIO7',
            'CE1',
            'P1-26'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 7
    },
    12: {
        pins: [
            'GPIO10',
            'MOSI0',
            'P1-19'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 10
    },
    13: {
        pins: [
            'GPIO9',
            'MISO0',
            'P1-21'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 9
    },
    14: {
        pins: [
            'GPIO11',
            'SCLK0',
            'P1-23'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 11
    },
    15: {
        pins: [
            'GPIO14',
            'TXD0',
            'P1-8'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.UART
        ],
        gpio: 14
    },
    16: {
        pins: [
            'GPIO15',
            'RXD0',
            'P1-10'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.UART
        ],
        gpio: 15
    },
    21: {
        pins: [
            'GPIO5',
            'P1-29'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 5
    },
    22: {
        pins: [
            'GPIO6',
            'P1-31'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 6
    },
    23: {
        pins: [
            'GPIO13',
            'P1-33',
            'PWM1'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.PWM
        ],
        gpio: 13
    },
    24: {
        pins: [
            'GPIO19',
            'PWM1',
            'MISO1',
            'P1-35'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.PWM,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 19
    },
    25: {
        pins: [
            'GPIO26',
            'P1-37'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 26
    },
    26: {
        pins: [
            'GPIO12',
            'PWM0',
            'P1-32'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.PWM
        ],
        gpio: 12
    },
    27: {
        pins: [
            'GPIO16',
            'P1-36'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO
        ],
        gpio: 16
    },
    28: {
        pins: [
            'GPIO20',
            'MOSI1',
            'P1-38'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 20
    },
    29: {
        pins: [
            'GPIO21',
            'SCLK1',
            'P1-40'
        ],
        peripherals: [
            j5_io_types_1.PeripheralType.GPIO,
            j5_io_types_1.PeripheralType.SPI
        ],
        gpio: 21
    }
};
// Initialize the board info
let procInfo;
if (process.env.RASPI_IO_TEST_MODE) {
    procInfo = 'Revision:a21041';
}
else {
    procInfo = fs_1.readFileSync('/proc/cpuinfo').toString();
}
const revMatch = procInfo.match(/Revision\s*:\s*(.*)/);
if (!revMatch) {
    throw new Error('Unable to parse revision information in /proc/cpuinfo');
}
// If the board has been overclocked, the revision is modified, so clear it here
let rev = revMatch[1];
if (/10[0-9a-z]{5}/.test(rev)) { // Check for RPi 1 overclock
    rev = rev.substr(-4);
}
else if (/1a[0-9a-z]{5}/.test(rev)) { // Check for RPi 2 overclock
    rev = rev.substr(-6);
}
let pins;
switch (BOARD_REVISIONS[rev]) {
    case exports.VERSION_1_MODEL_A:
        // Information is scarce, and no one has complained about it not being supported
        throw new Error('Raspberry Pi 1 Model A boards are not supported.');
    case exports.VERSION_1_MODEL_B_REV_1:
        pins = B1;
        break;
    case exports.VERSION_1_MODEL_B_REV_2:
        pins = B2;
        break;
    case exports.VERSION_1_MODEL_ZERO:
    case exports.VERSION_1_MODEL_ZERO_W:
    case exports.VERSION_1_MODEL_A_PLUS:
    case exports.VERSION_1_MODEL_B_PLUS:
    case exports.VERSION_2_MODEL_B:
    case exports.VERSION_3_MODEL_B:
    case exports.VERSION_3_MODEL_B_PLUS:
    case exports.VERSION_3_MODEL_A_PLUS:
        pins = BPLUS;
        break;
    default:
        console.info(`Unknown board revision ${rev}, assuming Raspberry Pi Zero/2/3 pinout. ` +
            `Unless you are running a compute module or very old RPi this should work fine. ` +
            `Please report this board revision in a GitHub issue at https://github.com/nebrius/raspi-board.`);
        pins = BPLUS;
        break;
}
// Create the aliases
const aliases = {};
for (const pin in pins) {
    if (pins.hasOwnProperty(pin)) {
        const pinAliases = pins[pin].pins;
        for (const pinAlias of pinAliases) {
            aliases[pinAlias] = parseInt(pin, 10);
        }
    }
}
// Create the Wiring Pi to PIGPIO mapping
const pigpioMapping = {};
for (const pin in pins) {
    if (pins.hasOwnProperty(pin)) {
        pigpioMapping[pin] = pins[pin].gpio;
    }
}
function getBoardRevision() {
    return BOARD_REVISIONS[rev] || exports.VERSION_UNKNOWN;
}
exports.getBoardRevision = getBoardRevision;
function getPins() {
    return pins;
}
exports.getPins = getPins;
function getPinNumber(alias) {
    if (typeof alias !== 'number' && typeof alias !== 'string') {
        return null;
    }
    alias = alias.toString();
    if (Object.keys(pins).indexOf(alias) !== -1) {
        alias = parseInt(alias, 10);
    }
    else {
        alias = aliases[alias];
    }
    if (typeof alias === 'undefined') {
        return null;
    }
    return alias;
}
exports.getPinNumber = getPinNumber;
function getGpioNumber(alias) {
    const wiringpi = getPinNumber(alias);
    if (wiringpi === null) {
        return null;
    }
    return pigpioMapping[wiringpi];
}
exports.getGpioNumber = getGpioNumber;
//# sourceMappingURL=index.js.map
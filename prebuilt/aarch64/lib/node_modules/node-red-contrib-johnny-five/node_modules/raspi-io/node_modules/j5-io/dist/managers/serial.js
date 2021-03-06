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
// TODO: add unit tests for multiple simultaneous serial ports
const DEFAULT_BAUD_RATE = 9600;
var Action;
(function (Action) {
    Action[Action["Write"] = 0] = "Write";
    Action[Action["Close"] = 1] = "Close";
    Action[Action["Flush"] = 2] = "Flush";
    Action[Action["Config"] = 3] = "Config";
    Action[Action["Read"] = 4] = "Read";
    Action[Action["Stop"] = 5] = "Stop";
})(Action || (Action = {}));
class SerialPortManager {
    constructor(portId, serialModule, globalEventEmitter) {
        this.isOpen = false;
        this.actionQueue = [];
        this.isSerialProcessing = false;
        this.portId = portId;
        this.module = serialModule;
        this.eventEmitter = globalEventEmitter;
        this.serial = serialModule.createSerial({ portId: this.portId.toString() });
        core_1.setMode(this.serial, abstract_io_1.Mode.UNKNOWN);
    }
    get baudrate() {
        return this.serial.baudRate;
    }
    reset() {
        this.serial.removeAllListeners();
        this.serial.close();
        this.actionQueue = [];
        this.isSerialProcessing = false;
    }
    addToSerialQueue(action) {
        this.actionQueue.push(action);
        this.serialPump();
    }
    serialPump() {
        if (this.isSerialProcessing) {
            return;
        }
        const action = this.actionQueue.shift();
        if (!action) {
            return;
        }
        this.isSerialProcessing = true;
        const finalize = () => {
            this.isSerialProcessing = false;
            this.serialPump();
        };
        switch (action.type) {
            case Action.Write:
                if (!this.isOpen) {
                    throw new Error('Cannot write to closed serial port');
                }
                this.serial.write(Buffer.from(action.inBytes), finalize);
                break;
            case Action.Read:
                if (!this.isOpen) {
                    throw new Error('Cannot read from closed serial port');
                }
                // TODO: add support for action.maxBytesToRead
                this.serial.on('data', (data) => {
                    action.handler(Array.from(data.values()));
                });
                process.nextTick(finalize);
                break;
            case Action.Stop:
                if (!this.isOpen) {
                    throw new Error('Cannot stop closed serial port');
                }
                this.serial.removeAllListeners();
                process.nextTick(finalize);
                break;
            case Action.Config:
                this.serial.close(() => {
                    this.serial = this.module.createSerial({
                        baudRate: action.baud
                    });
                    core_1.setMode(this.serial, abstract_io_1.Mode.UNKNOWN);
                    if (process.env.RASPI_IO_TEST_MODE) {
                        this.eventEmitter.emit('$TEST_MODE-serial-instance-created', this.serial);
                    }
                    this.serial.open(() => {
                        this.serial.on('data', (data) => {
                            this.eventEmitter.emit(`serial-data-${this.portId}`, Array.from(data.values()));
                        });
                        this.isOpen = true;
                        finalize();
                    });
                });
                break;
            case Action.Close:
                this.serial.close(() => {
                    this.isOpen = false;
                    finalize();
                });
                break;
            case Action.Flush:
                if (!this.isOpen) {
                    throw new Error('Cannot flush closed serial port');
                }
                this.serial.flush(finalize);
                break;
            default:
                throw new Error('Internal error: unknown serial action type');
        }
    }
}
class SerialManager {
    constructor(serialModule, serialIds, globalEventEmitter) {
        this.serialPortManagers = {};
        this.module = serialModule;
        this.eventEmitter = globalEventEmitter;
        this.serialIds = serialIds;
    }
    reset() {
        for (const portId in this.serialPortManagers) {
            if (!this.serialPortManagers.hasOwnProperty(portId)) {
                continue;
            }
            this.serialPortManagers[portId].reset();
        }
        this.serialPortManagers = {};
    }
    serialConfig({ portId, baud, rxPin, txPin }) {
        if (!portId) {
            throw new Error('"portId" parameter missing in options');
        }
        if (typeof rxPin !== 'undefined' || typeof txPin !== 'undefined') {
            throw new Error('"txPin" and "rxPin" are not supported in "serialConfig"');
        }
        this.ensureManager(portId);
        if (!this.serialPortManagers[portId].isOpen || (baud && baud !== this.serialPortManagers[portId].baudrate)) {
            const action = {
                type: Action.Config,
                baud: typeof baud === 'number' ? baud : DEFAULT_BAUD_RATE
            };
            this.serialPortManagers[portId].addToSerialQueue(action);
        }
    }
    serialWrite(portId, inBytes) {
        if (!portId) {
            throw new Error('"portId" argument missing');
        }
        this.ensureManager(portId);
        const queueItem = {
            type: Action.Write,
            inBytes
        };
        this.serialPortManagers[portId].addToSerialQueue(queueItem);
    }
    serialRead(portId, maxBytesToReadOrHandler, handlerOrUndefined) {
        if (!portId) {
            throw new Error('"portId" argument missing');
        }
        this.ensureManager(portId);
        let handler;
        let maxBytesToRead;
        if (typeof maxBytesToReadOrHandler === 'function') {
            handler = maxBytesToReadOrHandler;
            maxBytesToRead = undefined;
        }
        else if (typeof handlerOrUndefined === 'function') {
            handler = handlerOrUndefined;
            maxBytesToRead = maxBytesToReadOrHandler;
        }
        else {
            throw new Error(core_1.createInternalErrorMessage('could not swizzle arguments'));
        }
        const action = {
            type: Action.Read,
            maxBytesToRead,
            handler
        };
        this.serialPortManagers[portId].addToSerialQueue(action);
    }
    serialStop(portId) {
        if (!portId) {
            throw new Error('"portId" argument missing');
        }
        this.ensureManager(portId);
        const action = {
            type: Action.Stop
        };
        this.serialPortManagers[portId].addToSerialQueue(action);
    }
    serialClose(portId) {
        if (!portId) {
            throw new Error('"portId" argument missing');
        }
        this.ensureManager(portId);
        const action = {
            type: Action.Close
        };
        this.serialPortManagers[portId].addToSerialQueue(action);
    }
    serialFlush(portId) {
        if (!portId) {
            throw new Error('"portId" argument missing');
        }
        this.ensureManager(portId);
        const action = {
            type: Action.Flush
        };
        this.serialPortManagers[portId].addToSerialQueue(action);
    }
    ensureManager(portId) {
        let portIdIsValid = false;
        for (const serialId in this.serialIds) {
            if (portId === this.serialIds[serialId]) {
                portIdIsValid = true;
                break;
            }
        }
        if (!portIdIsValid) {
            throw new Error(`Invalid serial port "${portId}"`);
        }
        if (!this.serialPortManagers[portId]) {
            this.serialPortManagers[portId] = new SerialPortManager(portId, this.module, this.eventEmitter);
        }
    }
}
exports.SerialManager = SerialManager;
//# sourceMappingURL=serial.js.map
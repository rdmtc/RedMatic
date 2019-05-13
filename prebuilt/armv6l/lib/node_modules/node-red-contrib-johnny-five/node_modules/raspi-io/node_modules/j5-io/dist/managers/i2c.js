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
var Action;
(function (Action) {
    Action[Action["Read"] = 0] = "Read";
    Action[Action["Write"] = 1] = "Write";
})(Action || (Action = {}));
class I2CPortManager {
    constructor(portId, i2cModule, globalEventEmitter) {
        this.actionQueue = [];
        this.isI2CProcessing = false;
        this.i2c = i2cModule.createI2C(portId);
        core_1.setMode(this.i2c, abstract_io_1.Mode.UNKNOWN);
        this.eventEmitter = globalEventEmitter;
    }
    reset() {
        this.isI2CProcessing = false;
        this.actionQueue = [];
    }
    addToQueue(action) {
        this.actionQueue.push(action);
        this.i2cPump();
    }
    i2cPump() {
        if (this.isI2CProcessing || !this.i2c.alive) {
            return;
        }
        const action = this.actionQueue.shift();
        if (!action) {
            return;
        }
        this.isI2CProcessing = true;
        const finalize = () => {
            this.isI2CProcessing = false;
            this.i2cPump();
        };
        switch (action.type) {
            case Action.Write:
                const { address: writeAddress, register: writeRegister, payload } = action;
                if (Array.isArray(payload)) {
                    if (typeof writeRegister === 'number') {
                        this.i2c.write(writeAddress, writeRegister, Buffer.from(payload), finalize);
                    }
                    else {
                        this.i2c.write(writeAddress, Buffer.from(payload), finalize);
                    }
                }
                else {
                    if (typeof writeRegister === 'number') {
                        this.i2c.writeByte(writeAddress, writeRegister, payload, finalize);
                    }
                    else {
                        this.i2c.writeByte(writeAddress, payload, finalize);
                    }
                }
                break;
            case Action.Read:
                const { continuous, address: readAddress, register: readRegister, bytesToRead, handler } = action;
                const readCB = (err, buffer) => {
                    if (err || !buffer) {
                        this.eventEmitter.emit('error', err);
                        return;
                    }
                    const arr = Array.from(buffer.values());
                    const eventName = `i2c-reply-${readAddress}-${typeof readRegister === 'number' ? readRegister : 0}`;
                    this.eventEmitter.emit(eventName, arr);
                    handler(arr);
                    if (continuous) {
                        setImmediate(() => {
                            const continuousAction = {
                                type: Action.Read,
                                continuous,
                                address: readAddress,
                                register: readRegister,
                                bytesToRead,
                                handler
                            };
                            this.addToQueue(continuousAction);
                        });
                    }
                    finalize();
                };
                if (typeof readRegister === 'number') {
                    this.i2c.read(readAddress, readRegister, bytesToRead, readCB);
                }
                else {
                    this.i2c.read(readAddress, bytesToRead, readCB);
                }
                break;
            default:
                throw new Error('Internal error: unknown serial action type');
        }
    }
}
class I2CManager {
    constructor(i2cModule, i2cIds, globalEventEmitter) {
        this.i2cPortManagers = {};
        for (const portIdAlias in i2cIds) {
            if (!i2cIds.hasOwnProperty(portIdAlias)) {
                continue;
            }
            const portId = i2cIds[portIdAlias];
            this.i2cPortManagers[portId] = new I2CPortManager(portId, i2cModule, globalEventEmitter);
        }
    }
    getI2CInstance(portId) {
        if (!portId) {
            throw new Error('"portId" argument missing');
        }
        if (!this.i2cPortManagers[portId]) {
            throw new Error(`No I2C Port Manager for port ${portId}`);
        }
        return this.i2cPortManagers[portId].i2c;
    }
    reset() {
        for (const portId in this.i2cPortManagers) {
            if (!this.i2cPortManagers.hasOwnProperty(portId)) {
                continue;
            }
            this.i2cPortManagers[portId].reset();
        }
        this.i2cPortManagers = {};
    }
    i2cWrite(portId, address, register, payload) {
        if (!this.i2cPortManagers.hasOwnProperty(portId)) {
            throw new Error(`Invalid I2C port ID ${portId}`);
        }
        const action = {
            type: Action.Write,
            address,
            register,
            payload
        };
        this.i2cPortManagers[portId].addToQueue(action);
    }
    i2cRead(portId, continuous, address, register, bytesToRead, handler) {
        if (!this.i2cPortManagers.hasOwnProperty(portId)) {
            throw new Error(`Invalid I2C port ID ${portId}`);
        }
        const action = {
            type: Action.Read,
            continuous,
            address,
            register,
            bytesToRead,
            handler
        };
        this.i2cPortManagers[portId].addToQueue(action);
    }
}
exports.I2CManager = I2CManager;
//# sourceMappingURL=i2c.js.map
/// <reference types="node" />
import { II2CModule, II2C } from 'j5-io-types';
import { Handler } from 'abstract-io';
import { EventEmitter } from 'events';
export declare class I2CManager {
    private i2cPortManagers;
    constructor(i2cModule: II2CModule, i2cIds: {
        [id: string]: any;
    }, globalEventEmitter: EventEmitter);
    getI2CInstance(portId: string | number): II2C;
    reset(): void;
    i2cWrite(portId: string | number, address: number, register: number | undefined, payload: number[] | number): void;
    i2cRead(portId: string | number, continuous: boolean, address: number, register: number | undefined, bytesToRead: number, handler: Handler<number[]>): void;
}

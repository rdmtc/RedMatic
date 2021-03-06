/// <reference types="node" />
import { EventEmitter } from 'events';
import { IPeripheral } from 'j5-io-types';
export declare class Peripheral extends EventEmitter implements IPeripheral {
    private _alive;
    readonly alive: boolean;
    private _pins;
    readonly pins: number[];
    constructor(pins: string | number | Array<string | number>);
    destroy(): void;
    validateAlive(): void;
}

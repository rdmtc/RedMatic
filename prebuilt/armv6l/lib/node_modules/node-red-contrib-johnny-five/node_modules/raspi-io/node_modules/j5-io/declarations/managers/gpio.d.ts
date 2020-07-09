/// <reference types="node" />
import { IGPIOModule } from 'j5-io-types';
import { Value } from 'abstract-io';
import { EventEmitter } from 'events';
export declare class GPIOManager {
    private module;
    private eventEmitter;
    private intervals;
    constructor(gpioModule: IGPIOModule, globalEventEmitter: EventEmitter);
    reset(): void;
    setInputMode(pin: number, pullResistor?: number): void;
    setOutputMode(pin: number): void;
    digitalWrite(pin: number, value: Value): void;
    digitalRead(pin: number, handler: (value: Value) => void): void;
}

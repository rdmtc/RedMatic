/// <reference types="node" />
import { ISerialModule } from 'j5-io-types';
import { ISerialConfig, Handler } from 'abstract-io';
import { EventEmitter } from 'events';
export declare class SerialManager {
    private module;
    private serialPortManagers;
    private eventEmitter;
    private serialIds;
    constructor(serialModule: ISerialModule, serialIds: {
        [id: string]: any;
    }, globalEventEmitter: EventEmitter);
    reset(): void;
    serialConfig({ portId, baud, rxPin, txPin }: ISerialConfig): void;
    serialWrite(portId: string | number, inBytes: number[]): void;
    serialRead(portId: number | string, maxBytesToReadOrHandler: Handler<number[]> | number, handlerOrUndefined?: Handler<number[]>): void;
    serialStop(portId: number | string): void;
    serialClose(portId: number | string): void;
    serialFlush(portId: number | string): void;
    private ensureManager;
}

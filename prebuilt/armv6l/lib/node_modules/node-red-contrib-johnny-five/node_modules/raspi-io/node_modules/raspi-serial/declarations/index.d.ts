/// <reference types="node" />
import { Peripheral } from 'raspi-peripheral';
import { ISerial, ISerialModule, ISerialOptions } from 'j5-io-types';
export declare const PARITY_NONE = "none";
export declare const PARITY_EVEN = "even";
export declare const PARITY_ODD = "odd";
export declare const PARITY_MARK = "mark";
export declare const PARITY_SPACE = "space";
export declare const DEFAULT_PORT = "/dev/ttyAMA0";
export declare type Callback = () => void;
export declare type ErrorCallback = (err: Error | string) => void;
export declare class Serial extends Peripheral implements ISerial {
    private _portId;
    private _options;
    private _portInstance;
    private _isOpen;
    constructor({ portId, baudRate, dataBits, stopBits, parity }?: ISerialOptions);
    readonly port: string;
    readonly baudRate: number;
    readonly dataBits: number;
    readonly stopBits: number;
    readonly parity: string;
    destroy(): void;
    open(cb?: Callback): void;
    close(cb?: ErrorCallback): void;
    write(data: Buffer | string, cb?: Callback): void;
    flush(cb?: ErrorCallback): void;
}
export declare const module: ISerialModule;

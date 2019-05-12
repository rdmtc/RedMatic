import { Peripheral } from 'raspi-peripheral';
import { ILEDModule, ILED } from 'j5-io-types';
export declare const OFF = 0;
export declare const ON = 1;
export declare class LED extends Peripheral implements ILED {
    constructor();
    hasLed(): boolean;
    read(): 0 | 1;
    write(value: 0 | 1): void;
}
export declare const module: ILEDModule;

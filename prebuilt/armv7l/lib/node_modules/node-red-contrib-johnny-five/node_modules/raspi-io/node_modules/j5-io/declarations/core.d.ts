import { Mode } from 'abstract-io';
import { IPeripheral, IBaseModule } from 'j5-io-types';
export declare function createInternalErrorMessage(msg: string): string;
export declare function setBaseModule(module: IBaseModule): void;
export declare function getPeripheral(pin: number): IPeripheral | undefined;
export declare function getPeripherals(): {
    [pin: number]: IPeripheral;
};
export declare function getMode(peripheral: IPeripheral): Mode;
export declare function setMode(peripheral: IPeripheral, mode: Mode): void;
export declare function normalizePin(pin: string | number): number;
export declare function constrain(value: number, min: number, max: number): number;

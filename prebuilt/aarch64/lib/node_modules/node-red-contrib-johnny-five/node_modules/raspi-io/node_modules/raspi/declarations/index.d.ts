import { IBaseModule, IPeripheral } from 'j5-io-types';
export declare function init(cb: () => void): void;
export declare function getActivePeripherals(): {
    [pin: number]: IPeripheral;
};
export declare function getActivePeripheral(pin: number): IPeripheral | undefined;
export declare function setActivePeripheral(pin: number, peripheral: IPeripheral): void;
export declare function getPinNumber(alias: string | number): number | null;
export declare const module: IBaseModule;

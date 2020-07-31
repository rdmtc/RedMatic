import { Peripheral } from 'raspi-peripheral';
import { IDigitalInput, IDigitalOutput, IGPIOModule } from 'j5-io-types';
export interface IConfig {
    pin: number | string;
    pullResistor?: number;
}
export declare const LOW = 0;
export declare const HIGH = 1;
export declare const PULL_NONE: number;
export declare const PULL_DOWN: number;
export declare const PULL_UP: number;
export declare class DigitalOutput extends Peripheral implements IDigitalOutput {
    private _output;
    private _currentValue;
    readonly value: number;
    constructor(config: number | string | IConfig);
    write(value: number): void;
}
export declare class DigitalInput extends Peripheral implements IDigitalInput {
    readonly pullResistor: number;
    readonly value: number;
    private _input;
    private _currentValue;
    constructor(config: number | string | IConfig);
    destroy(): void;
    read(): number;
}
export declare const module: IGPIOModule;

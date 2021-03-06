import { Peripheral } from 'raspi-peripheral';
import { IPWM, IPWMModule, IPWMConfig } from 'j5-io-types';
export { IPWMConfig } from 'j5-io-types';
export declare class SoftPWM extends Peripheral implements IPWM {
    private _pwm;
    private _frequency;
    private _range;
    private _dutyCycle;
    readonly frequency: number;
    readonly range: number;
    readonly dutyCycle: number;
    constructor(config: number | string | IPWMConfig);
    write(dutyCycle: number): void;
}
export declare const module: IPWMModule;

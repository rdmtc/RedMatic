import { IPWMModule } from 'j5-io-types';
export declare class PWMManager {
    private module;
    private ranges;
    constructor(pwmModule: IPWMModule);
    reset(): void;
    setServoMode(pin: number, frequency?: number, range?: number): void;
    setPWMMode(pin: number): void;
    pwmWrite(pin: number, dutyCycle: number): void;
    servoConfig(pin: number, min?: number, max?: number): void;
    servoWrite(pin: number, value: number): void;
}

import { IBaseModule, IGPIOModule, ILEDModule, IPWMModule, ISerialModule, II2CModule, IPeripheral, IPinInfo, ILED, II2C } from 'j5-io-types';
import { AbstractIO, Value, Mode, IPinConfiguration, ISerialConfig, IServoConfig, II2CConfig, Handler } from 'abstract-io';
declare const serialPortIds: unique symbol;
declare const i2cPortIds: unique symbol;
declare const name: unique symbol;
declare const isReady: unique symbol;
declare const pins: unique symbol;
declare const defaultLed: unique symbol;
declare const gpioManager: unique symbol;
declare const pwmManager: unique symbol;
declare const ledManager: unique symbol;
declare const serialManager: unique symbol;
declare const i2cManager: unique symbol;
declare const swizzleI2CReadArguments: unique symbol;
export interface IOptions {
    pluginName: string;
    platform: {
        base: IBaseModule;
        gpio: IGPIOModule;
        pwm: IPWMModule;
        led?: ILEDModule;
        serial?: ISerialModule;
        i2c?: II2CModule;
    };
    serialIds?: {
        [id: string]: any;
    };
    i2cIds?: {
        [id: string]: any;
    };
    pinInfo: {
        [pin: number]: IPinInfo;
    };
}
export declare class J5IO extends AbstractIO {
    get defaultLed(): number | undefined;
    get name(): string;
    get SERIAL_PORT_IDs(): {
        [id: string]: any;
    };
    get I2C_PORT_IDS(): {
        [id: string]: any;
    };
    get pins(): ReadonlyArray<IPinConfiguration>;
    get analogPins(): ReadonlyArray<number>;
    get isReady(): boolean;
    getInternalPinInstances?: () => {
        [pin: number]: IPeripheral;
    };
    getI2CInstance?: (portId: string | number) => II2C | undefined;
    getLEDInstance?: () => ILED | undefined;
    private [serialPortIds];
    private [i2cPortIds];
    private [isReady];
    private [pins];
    private [name];
    private [defaultLed];
    private [gpioManager];
    private [pwmManager];
    private [ledManager]?;
    private [serialManager]?;
    private [i2cManager]?;
    constructor(options: IOptions);
    reset(): void;
    normalize(pin: number | string): number;
    pinMode(pin: string | number, mode: Mode): void;
    digitalRead(pin: string | number, handler: (value: Value) => void): void;
    digitalWrite(pin: string | number, value: number): void;
    pwmWrite(pin: string | number, value: number): void;
    servoWrite(pin: string | number, value: number): void;
    servoConfig(options: IServoConfig): void;
    servoConfig(pin: number | string, min: number, max: number): void;
    serialConfig(options: ISerialConfig): void;
    serialWrite(portId: string | number, inBytes: number[]): void;
    serialRead(portId: number | string, handler: Handler<number[]>): void;
    serialRead(portId: number | string, maxBytesToRead: number, handler: Handler<number[]>): void;
    serialStop(portId: number | string): void;
    serialClose(portId: number | string): void;
    serialFlush(portId: number | string): void;
    i2cConfig(options: II2CConfig): void;
    i2cWrite(address: number, byte: number): void;
    i2cWrite(address: number, inBytes: number[]): void;
    i2cWrite(address: number, register: number, byte: number): void;
    i2cWrite(address: number, register: number, inBytes: number[]): void;
    i2cWriteReg(address: number, register: number, value: number): void;
    i2cRead(address: number, bytesToRead: number, handler: Handler<number[]>): void;
    i2cRead(address: number, register: number, bytesToRead: number, handler: Handler<number[]>): void;
    i2cReadOnce(address: number, bytesToRead: number, handler: Handler<number[]>): void;
    i2cReadOnce(address: number, register: number, bytesToRead: number, handler: Handler<number[]>): void;
    private [swizzleI2CReadArguments];
    private supportsMode;
    private validateSupportedMode;
}
export {};

/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum Mode {
    INPUT = 0,
    OUTPUT = 1,
    ANALOG = 2,
    PWM = 3,
    SERVO = 4,
    STEPPER = 5,
    UNKNOWN = 99
}
export declare enum Value {
    HIGH = 1,
    LOW = 0
}
export interface IPinConfiguration {
    supportedModes: Mode[];
    mode: Mode;
    value: number | null;
    report: 0 | 1;
    analogChannel: number;
}
export interface IPingReadSettings {
    pin: number | string;
    value?: number;
    pulseOut?: number;
}
export interface II2CConfig {
    address: number;
    bus?: number | string;
    port?: number;
    delay?: number;
}
export interface ISerialConfig {
    portId: number | string;
    baud?: number;
    dataBits?: 5 | 6 | 7 | 8;
    parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';
    stopBits?: 1 | 1.5 | 2;
    rxPin?: number | string;
    txPin?: number | string;
}
export interface IServoConfig {
    pin: number | string;
    min?: number;
    max?: number;
}
export declare enum StepperType {
    DRIVER = 1,
    TWO_WIRE = 2,
    THREE_WIRE = 3,
    FOUR_WIRE = 4
}
export declare enum StepperStepSize {
    WHOLE = 0,
    HALF = 1
}
export declare enum StepperDirection {
    CCW = 0,
    CW = 1
}
export interface IAccelStepperConfig {
    deviceNum: number;
    type?: StepperType;
    stepSize?: StepperStepSize;
    stepPin?: number;
    directionPin?: number;
    motorPin1?: number;
    motorPin2?: number;
    motorPin3?: number;
    motorPin4?: number;
    enablePin?: number;
    invertPins?: number;
}
export interface IMultiStepperConfig {
    groupNum: number;
    devices: number[];
}
export declare type Callback = (err: Error | undefined) => void;
export declare type CallbackWithValue<T> = (err: Error | undefined, value: T) => void;
export declare type Handler<T> = (data: T) => void;
export declare class AbstractIO extends EventEmitter {
    readonly MODES: Readonly<{
        INPUT: Mode;
        OUTPUT: Mode;
        ANALOG: Mode;
        PWM: Mode;
        SERVO: Mode;
        UNKNOWN: Mode;
    }>;
    readonly HIGH: Value;
    readonly LOW: Value;
    readonly pins: ReadonlyArray<IPinConfiguration>;
    readonly analogPins: ReadonlyArray<number>;
    readonly name: string;
    readonly defaultLed: string | number | undefined;
    readonly isReady: boolean;
    readonly SERIAL_PORT_IDs: Readonly<{
        [portId: string]: any;
    }>;
    pinMode(pin: string | number, mode: Mode): void;
    pwmWrite(pin: string | number, value: number): void;
    servoWrite(pin: string | number, value: number): void;
    digitalWrite(pin: string | number, value: number): void;
    flushDigitalPorts(): void;
    i2cWrite(address: number, register: number): void;
    i2cWrite(address: number, inBytes: number[]): void;
    i2cWrite(address: number, register: number, inBytes: number[]): void;
    i2cWriteReg(address: number, register: number, value: number): void;
    serialWrite(portId: string | number, inBytes: number[]): void;
    analogRead(pin: string | number, handler: (value: number) => void): void;
    digitalRead(pin: string | number, handler: (value: Value) => void): void;
    i2cRead(address: number, bytesToRead: number, handler: Handler<number[]>): void;
    i2cRead(address: number, register: number, bytesToRead: number, handler: Handler<number[]>): void;
    i2cReadOnce(address: number, bytesToRead: number, handler: Handler<number[]>): void;
    i2cReadOnce(address: number, register: number, bytesToRead: number, handler: Handler<number[]>): void;
    pingRead(settings: IPingReadSettings, handler: (duration: number) => void): void;
    serialRead(portId: number | string, handler: Handler<number[]>): void;
    serialRead(portId: number | string, maxBytesToRead: number, handler: Handler<number[]>): void;
    i2cConfig(options: II2CConfig): void;
    serialConfig(options: ISerialConfig): void;
    servoConfig(options: IServoConfig): void;
    servoConfig(pin: number, min: number, max: number): void;
    serialStop(portId: number | string): void;
    serialClose(portId: number | string): void;
    serialFlush(portId: number | string): void;
    normalize(pin: number | string): number;
    setSamplingInterval(interval: number): void;
    sendOneWireConfig(pin: string | number, enableParasiticPower: boolean): void;
    sendOneWireSearch(pin: string | number, cb: CallbackWithValue<number[]>): void;
    sendOneWireAlarmsSearch(pin: string | number, cb: CallbackWithValue<number[]>): void;
    sendOneWireRead(pin: string | number, device: number, numBytesToRead: number, callback: CallbackWithValue<number[]>): void;
    sendOneWireReset(pin: string | number): void;
    sendOneWireWrite(pin: string | number, device: number, data: number | number[]): void;
    sendOneWireDelay(pin: string | number, delay: number): void;
    sendOneWireWriteAndRead(pin: number | string, device: number, data: number | number[], numBytesToRead: number, callback: CallbackWithValue<number[]>): void;
    stepperConfig(deviceNum: number, type: number, stepsPerRev: number, dirOrMotor1Pin: number, dirOrMotor2Pin: number, motorPin3?: number, motorPin4?: number): void;
    stepperStep(deviceNum: number, direction: number, steps: number, speed: number, callback: Callback): void;
    stepperStep(deviceNum: number, direction: number, steps: number, speed: number, accel: number, decel: number, callback: Callback): void;
    accelStepperConfig(config: IAccelStepperConfig): void;
    accelStepperZero(deviceNum: number): void;
    accelStepperStep(deviceNum: number, steps: number, callback?: Callback): void;
    accelStepperTo(deviceNum: number, position: number, callback?: Callback): void;
    accelStepperEnable(deviceNum: number, enabled: boolean): void;
    accelStepperStop(deviceNum: number): void;
    accelStepperReportPosition(deviceNum: number): void;
    accelStepperSpeed(deviceNum: number, speed: number): void;
    accelStepperAcceleration(deviceNum: number, acceleration: number): void;
    multiStepperConfig(config: IMultiStepperConfig): void;
    multiStepperTo(groupNum: number, positions: number[], callback?: Callback): void;
    multiStepperStop(groupNum: number): void;
    analogWrite(pin: string | number, value: number): void;
    sendI2CConfig(options: II2CConfig): void;
    sendI2CWriteRequest(address: number, inBytes: number[]): void;
    sendI2CWriteRequest(address: number, register: number, inBytes: number[]): void;
    sendI2CReadRequest(address: number, bytesToRead: number, handler: Handler<number[]>): void;
    sendI2CReadRequest(address: number, register: number, bytesToRead: number, handler: Handler<number[]>): void;
    reset(): void;
    reportAnalogPin(): void;
    reportDigitalPin(): void;
    pulseIn(): void;
    queryCapabilities(cb: Callback): void;
    queryAnalogMapping(cb: Callback): void;
    queryPinState(pin: string | number, cb: Callback): void;
}

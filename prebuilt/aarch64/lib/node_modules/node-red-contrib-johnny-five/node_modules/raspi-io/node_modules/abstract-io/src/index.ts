/*
MIT License

Copyright (c) 2018 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { EventEmitter } from 'events';

export enum Mode {
  INPUT = 0,
  OUTPUT = 1,
  ANALOG = 2,
  PWM = 3,
  SERVO = 4,
  STEPPER = 5,
  UNKNOWN = 99
}

export enum Value {
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

export enum StepperType {
  DRIVER = 1,
  TWO_WIRE = 2,
  THREE_WIRE = 3,
  FOUR_WIRE = 4
}

export enum StepperStepSize {
  WHOLE = 0,
  HALF = 1
}

export enum StepperDirection {
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

export type Callback = (err: Error | undefined) => void;

export type CallbackWithValue<T> = (err: Error | undefined, value: T) => void;

export type Handler<T> = (data: T) => void;

export class AbstractIO extends EventEmitter {
  public get MODES() {
    return Object.freeze({
      INPUT: Mode.INPUT,
      OUTPUT: Mode.OUTPUT,
      ANALOG: Mode.ANALOG,
      PWM: Mode.PWM,
      SERVO: Mode.SERVO,
      UNKNOWN: Mode.UNKNOWN
    });
  }

  public get HIGH() {
    return Value.HIGH;
  }
  public get LOW() {
    return Value.LOW;
  }

  public get pins(): ReadonlyArray<IPinConfiguration> {
    throw new Error(`The "pins" property must be overridden by a derived IO Plugin class`);
  }

  public get analogPins(): ReadonlyArray<number> {
    throw new Error(`The "analogPins" property must be overridden by a derived IO Plugin class`);
  }

  public get name(): string {
    throw new Error(`The "name" property must be overridden by a derived IO Plugin class`);
  }

  public get defaultLed(): string | number | undefined {
    return undefined;
  }

  public get isReady(): boolean {
    throw new Error(`The "isReady" property must be overridden by a derived IO Plugin class`);
  }

  public get SERIAL_PORT_IDs(): Readonly<{ [ portId: string ]: any }> {
    throw new Error(`The "SERIAL_PORT_IDs" property must be overridden by a derived IO Plugin class`);
  }

  public pinMode(pin: string | number, mode: Mode): void {
    throw new Error(`The "pinMode" method must be overridden by a derived IO Plugin class`);
  }

  // Writing methods

  public pwmWrite(pin: string | number, value: number): void {
    throw new Error(`pwmWrite is not supported by ${this.name}`);
  }

  public servoWrite(pin: string | number, value: number): void {
    throw new Error(`servoWrite is not supported by ${this.name}`);
  }

  public digitalWrite(pin: string | number, value: number): void {
    throw new Error(`digitalWrite is not supported by ${this.name}`);
  }

  public flushDigitalPorts(): void {
    throw new Error(`flushDigitalPorts is not supported by ${this.name}`);
  }

  public i2cWrite(address: number, register: number): void;
  public i2cWrite(address: number, inBytes: number[]): void;
  public i2cWrite(address: number, register: number, inBytes: number[]): void;
  public i2cWrite(address: number, registerOrInBytes: number | number[], inBytes?: number[]): void {
    throw new Error(`i2cWrite is not supported by ${this.name}`);
  }

  public i2cWriteReg(address: number, register: number, value: number): void {
    throw new Error(`i2cWriteReg is not supported by ${this.name}`);
  }

  public serialWrite(portId: string | number, inBytes: number[]): void {
    throw new Error(`serialWrite is not supported by ${this.name}`);
  }

  // Reading methods

  public analogRead(pin: string | number, handler: (value: number) => void): void {
    throw new Error(`analogRead is not supported by ${this.name}`);
  }

  public digitalRead(pin: string | number, handler: (value: Value) => void): void {
    throw new Error(`digitalRead is not supported by ${this.name}`);
  }

  public i2cRead(
    address: number,
    bytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public i2cRead(
    address: number,
    register: number,
    bytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public i2cRead(
    address: number,
    registerOrBytesToRead: number,
    bytesToReadOrHandler: Handler<number[]> | number,
    handler?: Handler<number[]>
  ): void {
    throw new Error(`i2cRead is not supported by ${this.name}`);
  }

  public i2cReadOnce(
    address: number,
    bytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public i2cReadOnce(
    address: number,
    register: number,
    bytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public i2cReadOnce(
    address: number,
    registerOrBytesToRead: number,
    bytesToReadOrHandler: Handler<number[]> | number,
    handler?: Handler<number[]>
  ): void {
    throw new Error(`i2cReadOnce is not supported by ${this.name}`);
  }

  public pingRead(settings: IPingReadSettings, handler: (duration: number) => void): void {
    throw new Error(`pingRead is not supported by ${this.name}`);
  }

  public serialRead(
    portId: number | string,
    handler: Handler<number[]>
  ): void;
  public serialRead(
    portId: number | string,
    maxBytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public serialRead(
    portId: number | string,
    maxBytesToReadOrHandler: Handler<number[]> | number,
    handler?: Handler<number[]>
  ): void {
    throw new Error(`serialRead is not supported by ${this.name}`);
  }

  // Configuring

  public i2cConfig(options: II2CConfig): void {
    throw new Error(`i2cConfig is not supported by ${this.name}`);
  }

  public serialConfig(options: ISerialConfig): void {
    throw new Error(`serialConfig is not supported by ${this.name}`);
  }

  public servoConfig(options: IServoConfig): void;
  public servoConfig(pin: number, min: number, max: number): void;
  public servoConfig(optionsOrPin: IServoConfig | string | number, min?: number, max?: number): void {
    throw new Error(`servoConfig is not supported by ${this.name}`);
  }

  // IO Control

  public serialStop(portId: number | string): void {
    throw new Error(`serialStop is not supported by ${this.name}`);
  }

  public serialClose(portId: number | string): void {
    throw new Error(`serialClose is not supported by ${this.name}`);
  }

  public serialFlush(portId: number | string): void {
    throw new Error(`serialFlush is not supported by ${this.name}`);
  }

  // Special

  public normalize(pin: number | string): number {
    throw new Error(`normalize is not supported by ${this.name}`);
  }

  // Miscellaneous methods that are not currently documented, see https://github.com/rwaldron/io-plugins/issues/22

  // Special

  public setSamplingInterval(interval: number): void {
    throw new Error(`setSamplingInterval is not supported by ${this.name}`);
  }

  // One Wire

  public sendOneWireConfig(pin: string | number, enableParasiticPower: boolean): void {
    throw new Error(`sendOneWireConfig is not supported by ${this.name}`);
  }

  public sendOneWireSearch(pin: string | number, cb: CallbackWithValue<number[]>): void {
    throw new Error(`sendOneWireSearch is not supported by ${this.name}`);
  }

  public sendOneWireAlarmsSearch(pin: string | number, cb: CallbackWithValue<number[]>): void {
    throw new Error(`sendOneWireAlarmsSearch is not supported by ${this.name}`);
  }

  public sendOneWireRead(
    pin: string | number,
    device: number,
    numBytesToRead: number,
    callback: CallbackWithValue<number[]>
  ): void {
    throw new Error(`sendOneWireRead is not supported by ${this.name}`);
  }

  public sendOneWireReset(pin: string | number): void {
    throw new Error(`sendOneWireReset is not supported by ${this.name}`);
  }

  public sendOneWireWrite(pin: string | number, device: number, data: number | number[]): void {
    throw new Error(`sendOneWireWrite is not supported by ${this.name}`);
  }

  public sendOneWireDelay(pin: string | number, delay: number): void {
    throw new Error(`sendOneWireDelay is not supported by ${this.name}`);
  }

  public sendOneWireWriteAndRead(
    pin: number | string,
    device: number,
    data: number | number[],
    numBytesToRead: number,
    callback: CallbackWithValue<number[]>
  ): void {
    throw new Error(`sendOneWireWriteAndRead is not supported by ${this.name}`);
  }

  // Stepper

  public stepperConfig(
    deviceNum: number,
    type: number,
    stepsPerRev: number,
    dirOrMotor1Pin: number,
    dirOrMotor2Pin: number,
    motorPin3?: number,
    motorPin4?: number
  ): void {
    throw new Error(`stepperConfig is not supported by ${this.name}`);
  }

  public stepperStep(
    deviceNum: number,
    direction: number,
    steps: number,
    speed: number,
    callback: Callback
  ): void;
  public stepperStep(
    deviceNum: number,
    direction: number,
    steps: number,
    speed: number,
    accel: number,
    decel: number,
    callback: Callback
  ): void;
  public stepperStep(
    deviceNum: number,
    direction: number,
    steps: number,
    speed: number,
    accelOrCallback: number | Callback,
    decel?: number,
    callback?: Callback
  ): void {
    throw new Error(`stepperStep is not supported by ${this.name}`);
  }

  // Accel Stepper

  public accelStepperConfig(config: IAccelStepperConfig): void {
    throw new Error(`accelStepperConfig is not supported by ${this.name}`);
  }

  public accelStepperZero(deviceNum: number): void {
    throw new Error(`accelStepperZero is not supported by ${this.name}`);
  }

  public accelStepperStep(deviceNum: number, steps: number, callback?: Callback): void {
    throw new Error(`accelStepperStep is not supported by ${this.name}`);
  }

  public accelStepperTo(deviceNum: number, position: number, callback?: Callback): void {
    throw new Error(`accelStepperTo is not supported by ${this.name}`);
  }

  public accelStepperEnable(deviceNum: number, enabled: boolean): void {
    throw new Error(`accelStepperEnable is not supported by ${this.name}`);
  }

  public accelStepperStop(deviceNum: number): void {
    throw new Error(`accelStepperStop is not supported by ${this.name}`);
  }

  public accelStepperReportPosition(deviceNum: number): void {
    throw new Error(`accelStepperReportPosition is not supported by ${this.name}`);
  }

  public accelStepperSpeed(deviceNum: number, speed: number): void {
    throw new Error(`accelStepperSpeed is not supported by ${this.name}`);
  }

  public accelStepperAcceleration(deviceNum: number, acceleration: number): void {
    throw new Error(`accelStepperAcceleration is not supported by ${this.name}`);
  }

  // Multi Stepper

  public multiStepperConfig(config: IMultiStepperConfig): void {
    throw new Error(`multiStepperConfig is not supported by ${this.name}`);
  }

  public multiStepperTo(groupNum: number, positions: number[], callback?: Callback): void {
    throw new Error(`multiStepperTo is not supported by ${this.name}`);
  }

  public multiStepperStop(groupNum: number): void {
    throw new Error(`multiStepperStop is not supported by ${this.name}`);
  }

  // Deprecated aliases and firmata.js compatibility functions that IO plugins don't need to worry about

  public analogWrite(pin: string | number, value: number): void {
    this.pwmWrite(pin, value);
  }

  public sendI2CConfig(options: II2CConfig) {
    return this.i2cConfig(options);
  }

  public sendI2CWriteRequest(address: number, inBytes: number[]): void;
  public sendI2CWriteRequest(address: number, register: number, inBytes: number[]): void;
  public sendI2CWriteRequest(address: number, registerOrInBytes: number | number[], inBytes?: number[]): void {
    return this.i2cWrite(address, registerOrInBytes as any, inBytes as any);
  }

  public sendI2CReadRequest(
    address: number,
    bytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public sendI2CReadRequest(
    address: number,
    register: number,
    bytesToRead: number,
    handler: Handler<number[]>
  ): void;
  public sendI2CReadRequest(
    address: number,
    registerOrBytesToRead: number,
    bytesToReadOrHandler: Handler<number[]> | number,
    handler?: Handler<number[]>
  ): void {
    return this.i2cReadOnce(address, registerOrBytesToRead, bytesToReadOrHandler as any, handler as any);
  }

  public reset() {
    throw new Error(`reset is not supported by ${this.name}`);
  }

  public reportAnalogPin() {
    throw new Error(`reportAnalogPin is not supported by ${this.name}`);
  }

  public reportDigitalPin() {
    throw new Error(`reportDigitalPin is not supported by ${this.name}`);
  }

  public pulseIn() {
    throw new Error(`pulseIn is not supported by ${this.name}`);
  }

  public queryCapabilities(cb: Callback): void {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  }

  public queryAnalogMapping(cb: Callback): void {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  }

  public queryPinState(pin: string | number, cb: Callback): void {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  }
}

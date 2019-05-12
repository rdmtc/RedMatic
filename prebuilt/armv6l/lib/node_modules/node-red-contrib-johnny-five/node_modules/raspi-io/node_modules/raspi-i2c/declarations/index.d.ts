import { Peripheral } from 'raspi-peripheral';
import { II2C, II2CModule, I2CReadBufferCallback, I2CReadNumberCallback, I2CWriteCallback } from 'j5-io-types';
export declare class I2C extends Peripheral implements II2C {
    private _devices;
    constructor();
    destroy(): void;
    read(address: number, length: number, cb: I2CReadBufferCallback): void;
    read(address: number, register: number, length: number, cb: I2CReadBufferCallback): void;
    readSync(address: number, registerOrLength: number | undefined, length?: number): Buffer;
    readByte(address: number, cb: I2CReadNumberCallback): void;
    readByte(address: number, register: number, cb: I2CReadNumberCallback): void;
    readByteSync(address: number, register?: number): number;
    readWord(address: number, cb: I2CReadNumberCallback): void;
    readWord(address: number, register: number, cb: I2CReadNumberCallback): void;
    readWordSync(address: number, register?: number): number;
    write(address: number, buffer: Buffer, cb?: I2CWriteCallback): void;
    write(address: number, register: number, buffer: Buffer, cb?: I2CWriteCallback): void;
    writeSync(address: number, buffer: Buffer): void;
    writeSync(address: number, register: number, buffer: Buffer): void;
    writeByte(address: number, byte: number, cb?: I2CWriteCallback): void;
    writeByte(address: number, register: number, byte: number, cb?: I2CWriteCallback): void;
    writeByteSync(address: number, registerOrByte: number, byte?: number): void;
    writeWord(address: number, word: number, cb?: I2CWriteCallback): void;
    writeWord(address: number, register: number, word: number, cb?: I2CWriteCallback): void;
    writeWordSync(address: number, registerOrWord: number, word?: number): void;
    private _getDevice;
}
export declare const module: II2CModule;

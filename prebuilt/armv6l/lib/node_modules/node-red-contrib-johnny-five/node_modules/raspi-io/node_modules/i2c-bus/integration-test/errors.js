'use strict';

const assert = require('assert');
const i2c = require('../');
const i2c1 = i2c.openSync(1);

//----------------------------------------------------------------------------
// Methods
//----------------------------------------------------------------------------

// open(busNumber [, options], cb)
assert.throws(_ => i2c.open('not an integer'), /Invalid I2C bus number/, 'open');
assert.throws(_ => i2c.open(-1), /Invalid I2C bus number/, 'open');

// openSync(busNumber [, options])
assert.throws(_ => i2c.openSync('not an integer'), /Invalid I2C bus number/, 'openSync');
assert.throws(_ => i2c.openSync(-1), /Invalid I2C bus number/, 'openSync');

//----------------------------------------------------------------------------
// Free resources
//----------------------------------------------------------------------------

// close(cb)
assert.throws(_ => i2c1.close('not a cb'), /Invalid callback/, 'close');

//----------------------------------------------------------------------------
// Information
//----------------------------------------------------------------------------

// i2cFuncs(cb)
assert.throws(_ => i2c1.i2cFuncs('not a cb'), /Invalid callback/, 'i2cFuncs');

// scan(cb)
assert.throws(_ => i2c1.scan('not a cb'), /Invalid callback/, 'scan');
assert.throws(_ => i2c1.scan(0, 'not a cb'), /Invalid callback/, 'scan');
assert.throws(_ => i2c1.scan(0, 0, 'not a cb'), /Invalid callback/, 'scan');
assert.throws(_ => i2c1.scan('not an addr', 'not a cb'), /Invalid callback/, 'scan');
assert.throws(_ => i2c1.scan('not an addr', 'not an addr', 'not a cb'), /Invalid callback/, 'scan');

assert.throws(_ => i2c1.scan('not an addr', _ => {}), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scan(-1, _ => {}), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scan(128, _ => {}), /Invalid I2C address/, 'scan');

assert.throws(_ => i2c1.scan(0, 'not an addr', _ => {}), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scan(0, -1, _ => {}), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scan(0, 128, _ => {}), /Invalid I2C address/, 'scan');

// scanSync(cb)
assert.throws(_ => i2c1.scanSync('not an addr'), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scanSync(-1), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scanSync(128), /Invalid I2C address/, 'scan');

assert.throws(_ => i2c1.scanSync(0, 'not an addr'), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scanSync(0, -1), /Invalid I2C address/, 'scan');
assert.throws(_ => i2c1.scanSync(0, 128), /Invalid I2C address/, 'scan');

//----------------------------------------------------------------------------
// Plain I2C
//----------------------------------------------------------------------------

// i2cRead(addr, length, buffer, cb)
assert.throws(_ => i2c1.i2cRead('not an addr', 100, Buffer.alloc(100), _ => {}), /Invalid I2C address/, 'i2cRead');
assert.throws(_ => i2c1.i2cRead(-1, 100, Buffer.alloc(100), _ => {}), /Invalid I2C address/, 'i2cRead');
assert.throws(_ => i2c1.i2cRead(128, 100, Buffer.alloc(100), _ => {}), /Invalid I2C address/, 'i2cRead');

assert.throws(_ => i2c1.i2cRead(0, 'not a length', Buffer.alloc(100), _ => {}), /Invalid buffer length/, 'i2cRead');
assert.throws(_ => i2c1.i2cRead(0, -1, Buffer.alloc(100), _ => {}), /Invalid buffer length/, 'i2cRead');

assert.throws(_ => i2c1.i2cRead(0, 100, 'not a buffer', _ => {}), /Invalid buffer/, 'i2cRead');

assert.throws(_ => i2c1.i2cRead(0, 101, Buffer.alloc(100), _ => {}), /Buffer must contain at least/, 'i2cRead');

assert.throws(_ => i2c1.i2cRead(0, 100, Buffer.alloc(100), 'not a cb'), /Invalid callback/, 'i2cRead');

// i2cReadSync(addr, length, buffer)
assert.throws(_ => i2c1.i2cReadSync('not an addr', 0), /Invalid I2C address/, 'i2cReadSync');
assert.throws(_ => i2c1.i2cReadSync(-1, 0), /Invalid I2C address/, 'i2cReadSync');
assert.throws(_ => i2c1.i2cReadSync(128, 0), /Invalid I2C address/, 'i2cReadSync');

assert.throws(_ => i2c1.i2cReadSync(0, 'not a length', Buffer.alloc(100)), /Invalid buffer length/, 'i2cReadSync');
assert.throws(_ => i2c1.i2cReadSync(0, -1, Buffer.alloc(100)), /Invalid buffer length/, 'i2cReadSync');

assert.throws(_ => i2c1.i2cReadSync(0, 100, 'not a buffer'), /Invalid buffer/, 'i2cReadSync');

assert.throws(_ => i2c1.i2cReadSync(0, 101, Buffer.alloc(100)), /Buffer must contain at least/, 'i2cReadSync');

// i2cWrite(addr, length, buffer, cb)
assert.throws(_ => i2c1.i2cWrite('not an addr', 0, _ => {}), /Invalid I2C address/, 'i2cWrite');
assert.throws(_ => i2c1.i2cWrite(-1, 0, _ => {}), /Invalid I2C address/, 'i2cWrite');
assert.throws(_ => i2c1.i2cWrite(128, 0, _ => {}), /Invalid I2C address/, 'i2cWrite');

assert.throws(_ => i2c1.i2cWrite(0, 'not a length', Buffer.alloc(100), _ => {}), /Invalid buffer length/, 'i2cWrite');
assert.throws(_ => i2c1.i2cWrite(0, -1, Buffer.alloc(100), _ => {}), /Invalid buffer length/, 'i2cWrite');

assert.throws(_ => i2c1.i2cWrite(0, 100, 'not a buffer', _ => {}), /Invalid buffer/, 'i2cWrite');

assert.throws(_ => i2c1.i2cWrite(0, 101, Buffer.alloc(100), _ => {}), /Buffer must contain at least/, 'i2cWrite');

assert.throws(_ => i2c1.i2cWrite(0, 100, Buffer.alloc(100), 'not a cb'), /Invalid callback/, 'i2cWrite');

// i2cWriteSync(addr, length, buffer)
assert.throws(_ => i2c1.i2cWriteSync('not an addr', 0), /Invalid I2C address/, 'i2cWriteSync');
assert.throws(_ => i2c1.i2cWriteSync(-1, 0), /Invalid I2C address/, 'i2cWriteSync');
assert.throws(_ => i2c1.i2cWriteSync(128, 0), /Invalid I2C address/, 'i2cWriteSync');

assert.throws(_ => i2c1.i2cWriteSync(0, 'not a length', Buffer.alloc(100)), /Invalid buffer length/, 'i2cWriteSync');
assert.throws(_ => i2c1.i2cWriteSync(0, -1, Buffer.alloc(100)), /Invalid buffer length/, 'i2cWriteSync');

assert.throws(_ => i2c1.i2cWriteSync(0, 100, 'not a buffer'), /Invalid buffer/, 'i2cWriteSync');

assert.throws(_ => i2c1.i2cWriteSync(0, 101, Buffer.alloc(100)), /Buffer must contain at least/, 'i2cWriteSync');

//----------------------------------------------------------------------------
// SMBus
//----------------------------------------------------------------------------

// readByte(addr, cmd, cb)
assert.throws(_ => i2c1.readByte('not an addr', 0, _ => {}), /Invalid I2C address/, 'readByte');
assert.throws(_ => i2c1.readByte(-1, 0, _ => {}), /Invalid I2C address/, 'readByte');
assert.throws(_ => i2c1.readByte(128, 0, _ => {}), /Invalid I2C address/, 'readByte');

assert.throws(_ => i2c1.readByte(0, 'not a command', _ => {}), /Invalid I2C command/, 'readByte');
assert.throws(_ => i2c1.readByte(0, -1, _ => {}), /Invalid I2C command/, 'readByte');
assert.throws(_ => i2c1.readByte(0, 256, _ => {}), /Invalid I2C command/, 'readByte');

assert.throws(_ => i2c1.readByte(0, 0, 'not a cb'), /Invalid callback/, 'readByte');

// readByteSync(addr, cmd)
assert.throws(_ => i2c1.readByteSync('not an addr', 0), /Invalid I2C address/, 'readByteSync');
assert.throws(_ => i2c1.readByteSync(-1, 0), /Invalid I2C address/, 'readByteSync');
assert.throws(_ => i2c1.readByteSync(128, 0), /Invalid I2C address/, 'readByteSync');

assert.throws(_ => i2c1.readByteSync(0, 'not a command'), /Invalid I2C command/, 'readByteSync');
assert.throws(_ => i2c1.readByteSync(0, -1), /Invalid I2C command/, 'readByteSync');
assert.throws(_ => i2c1.readByteSync(0, 256), /Invalid I2C command/, 'readByteSync');

// readWord(addr, cmd, cb)
assert.throws(_ => i2c1.readWord('not an addr', 0, _ => {}), /Invalid I2C address/, 'readWord');
assert.throws(_ => i2c1.readWord(-1, 0, _ => {}), /Invalid I2C address/, 'readWord');
assert.throws(_ => i2c1.readWord(128, 0, _ => {}), /Invalid I2C address/, 'readWord');

assert.throws(_ => i2c1.readWord(0, 'not a command', _ => {}), /Invalid I2C command/, 'readWord');
assert.throws(_ => i2c1.readWord(0, -1, _ => {}), /Invalid I2C command/, 'readWord');
assert.throws(_ => i2c1.readWord(0, 256, _ => {}), /Invalid I2C command/, 'readWord');

assert.throws(_ => i2c1.readWord(0, 0, 'not a cb'), /Invalid callback/, 'readWord');

// readWordSync(addr, cmd)
assert.throws(_ => i2c1.readWordSync('not an addr', 0), /Invalid I2C address/, 'readWordSync');
assert.throws(_ => i2c1.readWordSync(-1, 0), /Invalid I2C address/, 'readWordSync');
assert.throws(_ => i2c1.readWordSync(128, 0), /Invalid I2C address/, 'readWordSync');

assert.throws(_ => i2c1.readWordSync(0, 'not a command'), /Invalid I2C command/, 'readWordSync');
assert.throws(_ => i2c1.readWordSync(0, -1), /Invalid I2C command/, 'readWordSync');
assert.throws(_ => i2c1.readWordSync(0, 256), /Invalid I2C command/, 'readWordSync');

// readI2cBlock(addr, cmd, length, buffer, cb)
assert.throws(_ => i2c1.readI2cBlock('not an addr', 0, 10, Buffer.alloc(10), _ => {}), /Invalid I2C address/, 'readI2cBlock');
assert.throws(_ => i2c1.readI2cBlock(-1, 0, 10, Buffer.alloc(10), _ => {}), /Invalid I2C address/, 'readI2cBlock');
assert.throws(_ => i2c1.readI2cBlock(128, 0, 10, Buffer.alloc(10), _ => {}), /Invalid I2C address/, 'readI2cBlock');

assert.throws(_ => i2c1.readI2cBlock(0, 'not a command', 10, Buffer.alloc(10), _ => {}), /Invalid I2C command/, 'readI2cBlock');
assert.throws(_ => i2c1.readI2cBlock(0, -1, 10, Buffer.alloc(10), _ => {}), /Invalid I2C command/, 'readI2cBlock');
assert.throws(_ => i2c1.readI2cBlock(0, 256, 10, Buffer.alloc(10), _ => {}), /Invalid I2C command/, 'readI2cBlock');

assert.throws(_ => i2c1.readI2cBlock(0, 0, 'not a length', Buffer.alloc(10), _ => {}), /Invalid buffer length/, 'readI2cBlock');
assert.throws(_ => i2c1.readI2cBlock(0, 0, -1, Buffer.alloc(10), _ => {}), /Invalid buffer length/, 'readI2cBlock');
assert.throws(_ => i2c1.readI2cBlock(0, 0, 33, Buffer.alloc(33), _ => {}), /Invalid buffer length/, 'readI2cBlock');

assert.throws(_ => i2c1.readI2cBlock(0, 0, 10, 'not a buffer', _ => {}), /Invalid buffer/, 'readI2cBlock');

assert.throws(_ => i2c1.readI2cBlock(0, 0, 11, Buffer.alloc(10), _ => {}), /Buffer must contain at least/, 'readI2cBlock');

assert.throws(_ => i2c1.readI2cBlock(0, 0, 10, Buffer.alloc(10), 'not a cb'), /Invalid callback/, 'readI2cBlock');

// readI2cBlockSync(addr, cmd, length, buffer)
assert.throws(_ => i2c1.readI2cBlockSync('not an addr', 0, 10, Buffer.alloc(10)), /Invalid I2C address/, 'readI2cBlockSync');
assert.throws(_ => i2c1.readI2cBlockSync(-1, 0, 10, Buffer.alloc(10)), /Invalid I2C address/, 'readI2cBlockSync');
assert.throws(_ => i2c1.readI2cBlockSync(128, 0, 10, Buffer.alloc(10)), /Invalid I2C address/, 'readI2cBlockSync');

assert.throws(_ => i2c1.readI2cBlockSync(0, 'not a command', 10, Buffer.alloc(10)), /Invalid I2C command/, 'readI2cBlockSync');
assert.throws(_ => i2c1.readI2cBlockSync(0, -1, 10, Buffer.alloc(10)), /Invalid I2C command/, 'readI2cBlockSync');
assert.throws(_ => i2c1.readI2cBlockSync(0, 256, 10, Buffer.alloc(10)), /Invalid I2C command/, 'readI2cBlockSync');

assert.throws(_ => i2c1.readI2cBlockSync(0, 0, 'not a length', Buffer.alloc(10)), /Invalid buffer length/, 'readI2cBlockSync');
assert.throws(_ => i2c1.readI2cBlockSync(0, 0, -1, Buffer.alloc(10)), /Invalid buffer length/, 'readI2cBlockSync');
assert.throws(_ => i2c1.readI2cBlockSync(0, 0, 33, Buffer.alloc(33)), /Invalid buffer length/, 'readI2cBlockSync');

assert.throws(_ => i2c1.readI2cBlockSync(0, 0, 10, 'not a buffer'), /Invalid buffer/, 'readI2cBlockSync');

assert.throws(_ => i2c1.readI2cBlockSync(0, 0, 11, Buffer.alloc(10)), /Buffer must contain at least/, 'readI2cBlockSync');

// receiveByte(addr, cb)
assert.throws(_ => i2c1.receiveByte('not an addr', _ => {}), /Invalid I2C address/, 'receiveByte');
assert.throws(_ => i2c1.receiveByte(-1, _ => {}), /Invalid I2C address/, 'receiveByte');
assert.throws(_ => i2c1.receiveByte(128, _ => {}), /Invalid I2C address/, 'receiveByte');

assert.throws(_ => i2c1.receiveByte(0, 'not a cb'), /Invalid callback/, 'receiveByte');

// receiveByteSync(addr)
assert.throws(_ => i2c1.receiveByteSync('not an addr'), /Invalid I2C address/, 'receiveByteSync');
assert.throws(_ => i2c1.receiveByteSync(-1), /Invalid I2C address/, 'receiveByteSync');
assert.throws(_ => i2c1.receiveByteSync(128), /Invalid I2C address/, 'receiveByteSync');

// sendByte(addr, byte, cb)
assert.throws(_ => i2c1.sendByte('not an addr', 0, _ => {}), /Invalid I2C address/, 'sendByte');
assert.throws(_ => i2c1.sendByte(-1, 0, _ => {}), /Invalid I2C address/, 'sendByte');
assert.throws(_ => i2c1.sendByte(128, 0, _ => {}), /Invalid I2C address/, 'sendByte');

assert.throws(_ => i2c1.sendByte(0, 'not a byte', _ => {}), /Invalid byte/, 'sendByte');
assert.throws(_ => i2c1.sendByte(0, -1, _ => {}), /Invalid byte/, 'sendByte');
assert.throws(_ => i2c1.sendByte(0, 256, _ => {}), /Invalid byte/, 'sendByte');

assert.throws(_ => i2c1.sendByte(0, 0, 'not a cb'), /Invalid callback/, 'sendByte');

// sendByteSync(addr, byte)
assert.throws(_ => i2c1.sendByteSync('not an addr', 0), /Invalid I2C address/, 'sendByteSync');
assert.throws(_ => i2c1.sendByteSync(-1, 0), /Invalid I2C address/, 'sendByteSync');
assert.throws(_ => i2c1.sendByteSync(128, 0), /Invalid I2C address/, 'sendByteSync');

assert.throws(_ => i2c1.sendByteSync(0, 'not a byte'), /Invalid byte/, 'sendByteSync');
assert.throws(_ => i2c1.sendByteSync(0, -1), /Invalid byte/, 'sendByteSync');
assert.throws(_ => i2c1.sendByteSync(0, 256), /Invalid byte/, 'sendByteSync');

// writeByte(addr, cmd, byte, cb)
assert.throws(_ => i2c1.writeByte('not an addr', 0, 0, _ => {}), /Invalid I2C address/, 'writeByte');
assert.throws(_ => i2c1.writeByte(-1, 0, 0, _ => {}), /Invalid I2C address/, 'writeByte');
assert.throws(_ => i2c1.writeByte(128, 0, 0, _ => {}), /Invalid I2C address/, 'writeByte');

assert.throws(_ => i2c1.writeByte(0, 'not a command', 0, _ => {}), /Invalid I2C command/, 'writeByte');
assert.throws(_ => i2c1.writeByte(0, -1, 0, _ => {}), /Invalid I2C command/, 'writeByte');
assert.throws(_ => i2c1.writeByte(0, 256, 0, _ => {}), /Invalid I2C command/, 'writeByte');

assert.throws(_ => i2c1.writeByte(0, 0, 'not a byte', _ => {}), /Invalid byte/, 'writeByte');
assert.throws(_ => i2c1.writeByte(0, 0, -1, _ => {}), /Invalid byte/, 'writeByte');
assert.throws(_ => i2c1.writeByte(0, 0, 256, _ => {}), /Invalid byte/, 'writeByte');

assert.throws(_ => i2c1.writeByte(0, 0, 0, 'not a cb'), /Invalid callback/, 'writeByte');

// writeByteSync(addr, cmd, byte)
assert.throws(_ => i2c1.writeByteSync('not an addr', 0, 0), /Invalid I2C address/, 'writeByteSync');
assert.throws(_ => i2c1.writeByteSync(-1, 0, 0), /Invalid I2C address/, 'writeByteSync');
assert.throws(_ => i2c1.writeByteSync(128, 0, 0), /Invalid I2C address/, 'writeByteSync');

assert.throws(_ => i2c1.writeByteSync(0, 'not a command', 0), /Invalid I2C command/, 'writeByteSync');
assert.throws(_ => i2c1.writeByteSync(0, -1, 0), /Invalid I2C command/, 'writeByteSync');
assert.throws(_ => i2c1.writeByteSync(0, 256, 0), /Invalid I2C command/, 'writeByteSync');

assert.throws(_ => i2c1.writeByteSync(0, 0, 'not a byte'), /Invalid byte/, 'writeByteSync');
assert.throws(_ => i2c1.writeByteSync(0, 0, -1), /Invalid byte/, 'writeByteSync');
assert.throws(_ => i2c1.writeByteSync(0, 0, 256), /Invalid byte/, 'writeByteSync');

// writeWord(addr, cmd, word, cb)
assert.throws(_ => i2c1.writeWord('not an addr', 0, 0, _ => {}), /Invalid I2C address/, 'writeWord');
assert.throws(_ => i2c1.writeWord(-1, 0, 0, _ => {}), /Invalid I2C address/, 'writeWord');
assert.throws(_ => i2c1.writeWord(128, 0, 0, _ => {}), /Invalid I2C address/, 'writeWord');

assert.throws(_ => i2c1.writeWord(0, 'not a command', 0, _ => {}), /Invalid I2C command/, 'writeWord');
assert.throws(_ => i2c1.writeWord(0, -1, 0, _ => {}), /Invalid I2C command/, 'writeWord');
assert.throws(_ => i2c1.writeWord(0, 256, 0, _ => {}), /Invalid I2C command/, 'writeWord');

assert.throws(_ => i2c1.writeWord(0, 0, 'not a word', _ => {}), /Invalid word/, 'writeWord');
assert.throws(_ => i2c1.writeWord(0, 0, -1, _ => {}), /Invalid word/, 'writeWord');
assert.throws(_ => i2c1.writeWord(0, 0, 0xffff+1, _ => {}), /Invalid word/, 'writeWord');

assert.throws(_ => i2c1.writeWord(0, 0, 0, 'not a cb'), /Invalid callback/, 'writeWord');

// writeWordSync(addr, cmd, word)
assert.throws(_ => i2c1.writeWordSync('not an addr', 0, 0), /Invalid I2C address/, 'writeWordSync');
assert.throws(_ => i2c1.writeWordSync(-1, 0, 0), /Invalid I2C address/, 'writeWordSync');
assert.throws(_ => i2c1.writeWordSync(128, 0, 0), /Invalid I2C address/, 'writeWordSync');

assert.throws(_ => i2c1.writeWordSync(0, 'not a command', 0), /Invalid I2C command/, 'writeWordSync');
assert.throws(_ => i2c1.writeWordSync(0, -1, 0), /Invalid I2C command/, 'writeWordSync');
assert.throws(_ => i2c1.writeWordSync(0, 256, 0), /Invalid I2C command/, 'writeWordSync');

assert.throws(_ => i2c1.writeWordSync(0, 0, 'not a word'), /Invalid word/, 'writeWordSync');
assert.throws(_ => i2c1.writeWordSync(0, 0, -1), /Invalid word/, 'writeWordSync');
assert.throws(_ => i2c1.writeWordSync(0, 0, 0xffff+1), /Invalid word/, 'writeWordSync');

// writeQuick(addr, bit, cb)
assert.throws(_ => i2c1.writeQuick('not an addr', 0, _ => {}), /Invalid I2C address/, 'writeQuick');
assert.throws(_ => i2c1.writeQuick(-1, 0, _ => {}), /Invalid I2C address/, 'writeQuick');
assert.throws(_ => i2c1.writeQuick(128, 0, _ => {}), /Invalid I2C address/, 'writeQuick');

assert.throws(_ => i2c1.writeQuick(0, 'not a word', _ => {}), /Invalid bit/, 'writeQuick');
assert.throws(_ => i2c1.writeQuick(0, -1, _ => {}), /Invalid bit/, 'writeQuick');
assert.throws(_ => i2c1.writeQuick(0, 2, _ => {}), /Invalid bit/, 'writeQuick');

assert.throws(_ => i2c1.writeQuick(0, 0, 'not a cb'), /Invalid callback/, 'writeQuick');

// writeQuickSync(addr, bit)
assert.throws(_ => i2c1.writeQuickSync('not an addr', 0), /Invalid I2C address/, 'writeQuickSync');
assert.throws(_ => i2c1.writeQuickSync(-1, 0), /Invalid I2C address/, 'writeQuickSync');
assert.throws(_ => i2c1.writeQuickSync(128, 0), /Invalid I2C address/, 'writeQuickSync');

assert.throws(_ => i2c1.writeQuickSync(0, 'not a word'), /Invalid bit/, 'writeQuickSync');
assert.throws(_ => i2c1.writeQuickSync(0, -1), /Invalid bit/, 'writeQuickSync');
assert.throws(_ => i2c1.writeQuickSync(0, 2), /Invalid bit/, 'writeQuickSync');

// writeI2cBlock(addr, cmd, length, buffer, cb)
assert.throws(_ => i2c1.writeI2cBlock('not an addr', 0, 10, Buffer.alloc(10), _ => {}), /Invalid I2C address/, 'writeI2cBlock');
assert.throws(_ => i2c1.writeI2cBlock(-1, 0, 10, Buffer.alloc(10), _ => {}), /Invalid I2C address/, 'writeI2cBlock');
assert.throws(_ => i2c1.writeI2cBlock(128, 0, 10, Buffer.alloc(10), _ => {}), /Invalid I2C address/, 'writeI2cBlock');

assert.throws(_ => i2c1.writeI2cBlock(0, 'not a command', 10, Buffer.alloc(10), _ => {}), /Invalid I2C command/, 'writeI2cBlock');
assert.throws(_ => i2c1.writeI2cBlock(0, -1, 10, Buffer.alloc(10), _ => {}), /Invalid I2C command/, 'writeI2cBlock');
assert.throws(_ => i2c1.writeI2cBlock(0, 256, 10, Buffer.alloc(10), _ => {}), /Invalid I2C command/, 'writeI2cBlock');

assert.throws(_ => i2c1.writeI2cBlock(0, 0, 'not a length', Buffer.alloc(10), _ => {}), /Invalid buffer length/, 'writeI2cBlock');
assert.throws(_ => i2c1.writeI2cBlock(0, 0, -1, Buffer.alloc(10), _ => {}), /Invalid buffer length/, 'writeI2cBlock');
assert.throws(_ => i2c1.writeI2cBlock(0, 0, 33, Buffer.alloc(33), _ => {}), /Invalid buffer length/, 'writeI2cBlock');

assert.throws(_ => i2c1.writeI2cBlock(0, 0, 10, 'not a buffer', _ => {}), /Invalid buffer/, 'writeI2cBlock');

assert.throws(_ => i2c1.writeI2cBlock(0, 0, 11, Buffer.alloc(10), _ => {}), /Buffer must contain at least/, 'writeI2cBlock');

assert.throws(_ => i2c1.writeI2cBlock(0, 0, 10, Buffer.alloc(10), 'not a cb'), /Invalid callback/, 'writeI2cBlock');

// writeI2cBlockSync(addr, cmd, length, buffer)
assert.throws(_ => i2c1.writeI2cBlockSync('not an addr', 0, 10, Buffer.alloc(10)), /Invalid I2C address/, 'writeI2cBlockSync');
assert.throws(_ => i2c1.writeI2cBlockSync(-1, 0, 10, Buffer.alloc(10)), /Invalid I2C address/, 'writeI2cBlockSync');
assert.throws(_ => i2c1.writeI2cBlockSync(128, 0, 10, Buffer.alloc(10)), /Invalid I2C address/, 'writeI2cBlockSync');

assert.throws(_ => i2c1.writeI2cBlockSync(0, 'not a command', 10, Buffer.alloc(10)), /Invalid I2C command/, 'writeI2cBlockSync');
assert.throws(_ => i2c1.writeI2cBlockSync(0, -1, 10, Buffer.alloc(10)), /Invalid I2C command/, 'writeI2cBlockSync');
assert.throws(_ => i2c1.writeI2cBlockSync(0, 256, 10, Buffer.alloc(10)), /Invalid I2C command/, 'writeI2cBlockSync');

assert.throws(_ => i2c1.writeI2cBlockSync(0, 0, 'not a length', Buffer.alloc(10)), /Invalid buffer length/, 'writeI2cBlockSync');
assert.throws(_ => i2c1.writeI2cBlockSync(0, 0, -1, Buffer.alloc(10)), /Invalid buffer length/, 'writeI2cBlockSync');
assert.throws(_ => i2c1.writeI2cBlockSync(0, 0, 33, Buffer.alloc(33)), /Invalid buffer length/, 'writeI2cBlockSync');

assert.throws(_ => i2c1.writeI2cBlockSync(0, 0, 10, 'not a buffer'), /Invalid buffer/, 'writeI2cBlockSync');

assert.throws(_ => i2c1.writeI2cBlockSync(0, 0, 11, Buffer.alloc(10)), /Buffer must contain at least/, 'writeI2cBlockSync');

console.log('ok - errors');


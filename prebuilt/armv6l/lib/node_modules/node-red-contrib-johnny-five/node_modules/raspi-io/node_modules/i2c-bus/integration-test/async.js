'use strict';

const assert = require('assert');
const i2c = require('../');

const DS1621_ADDR = 0x48;
const CMD_ACCESS_CONFIG = 0xac;
const CMD_ACCESS_TL = 0xa2;

// Wait while non volatile memory busy
const waitForWrite = cb => {
  i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, (err, config) => {
    assert(!err, 'can\'t read config to determine memory status');
    if (config & 0x10) {
      return waitForWrite(cb);
    }
    cb();
  });
};

const finished = _ => i2c1.close(_ => console.log('ok - async'));

const i2cPlainReadWrite = _ => {
  // Test i2cWrite & i2cRead
  // Change value of tl to 25 and verify that tl has been changed
  const cmdSetTL = Buffer.from([CMD_ACCESS_TL, 25, 0]);
  const cmdGetTL = Buffer.from([CMD_ACCESS_TL]);
  const tl = Buffer.alloc(2);

  i2c1.i2cWrite(DS1621_ADDR, cmdSetTL.length, cmdSetTL, (err, bytesWritten, buffer) => {
    assert(!err, 'can\'t i2cWrite cmdSetTL');
    assert.strictEqual(bytesWritten, cmdSetTL.length, 'expected i2cWrite to write 3 bytes');
    assert.strictEqual(cmdSetTL, buffer, 'expected cmdSetTL to be passed to i2cWrite callback');

    waitForWrite(_ => {
      i2c1.i2cWrite(DS1621_ADDR, cmdGetTL.length, cmdGetTL, (err, bytesWritten, buffer) => {
        assert(!err, 'can\'t i2cWrite cmdGetTL');
        assert.strictEqual(bytesWritten, cmdGetTL.length, 'expected i2cWrite to write 1 byte');
        assert.strictEqual(cmdGetTL, buffer, 'expected cmdGetTL to be passed to i2cWrite callback');

        i2c1.i2cRead(DS1621_ADDR, 2, tl, (err, bytesRead, buffer) => {
          assert(!err, 'can\'t i2cRead tl');
          assert.strictEqual(bytesRead, 2, 'expected i2cRead to read 2 bytes');
          assert.strictEqual(tl.readUInt16LE(0), 25, 'expected i2cRead to read value 25');
          assert.strictEqual(tl, buffer, 'expected tl to be passed to i2cRead callback');

          finished();
        });
      });
    });
  });
};

const readWriteI2cBlock = _ => {
  // Test writeI2cBlock & readI2cBlock
  // Change value of tl to 22 and verify that tl has been changed
  const newtl = Buffer.alloc(10);

  newtl.writeUInt16LE(22, 0);
  i2c1.writeI2cBlock(DS1621_ADDR, CMD_ACCESS_TL, 2, newtl, (err, bytesWritten, buffer) => {
    assert(!err, 'can\'t writeI2cBlock to tl');
    assert.strictEqual(bytesWritten, 2, 'expected writeI2cBlock to write 2 bytes');
    assert.strictEqual(newtl, buffer, 'expected newtl to be passed to writeI2cBlock callback');

    waitForWrite(_ => {
      i2c1.readI2cBlock(DS1621_ADDR, CMD_ACCESS_TL, 2, newtl, (err, bytesRead, buffer) => {
        assert(!err, 'can\'t readI2cBlock from tl');
        assert.strictEqual(bytesRead, 2, 'expected readI2cBlock to read 2 bytes');
        assert.strictEqual(buffer.readUInt16LE(0), 22, 'expected readI2cBlock to read value 22');
        assert.strictEqual(newtl, buffer, 'expected newtl to be passed to readI2cBlock callback');

        i2cPlainReadWrite();
      });
    });
  });
};

const readWriteWord = _ => {
  // Test writeWord & readWord
  // Change value of tl and verify that tl has been changed
  i2c1.readWord(DS1621_ADDR, CMD_ACCESS_TL, (err, oldtl) => {
    assert(!err, 'can\'t readWord from tl');
    assert(typeof oldtl === 'number' && oldtl <= 0xffff, 'expeted readWord to read a word');

    const newtl = (oldtl === 24 ? 23 : 24);
    i2c1.writeWord(DS1621_ADDR, CMD_ACCESS_TL, newtl, err => {
      assert(!err, 'can\'t write word to tl');

      i2c1.readWord(DS1621_ADDR, CMD_ACCESS_TL, (err, newtl2) => {
        assert(!err, 'can\'t read new word from tl');
        assert(typeof newtl2 === 'number' && newtl2 <= 0xffff, 'expeted readWord to read a word');
        assert.strictEqual(newtl, newtl2, 'expected to read word written');

        readWriteI2cBlock();
      });
    });
  });
};

const sendReceiveByte = epectedConfig => {
  // Test sendByte & receiveByte
  // Read config and verify that it's epectedConfig
  i2c1.sendByte(DS1621_ADDR, CMD_ACCESS_CONFIG, err => {
    assert(!err, 'can\'t send byte to config');

    i2c1.receiveByte(DS1621_ADDR, (err, config) => {
      assert(!err, 'can\'t receive byte from config');
      assert(typeof config === 'number' && config <= 0xff, 'expeted receiveByte to receive a byte');
      assert.strictEqual(config, epectedConfig, '1st and 2nd config read differ');

      readWriteWord();
    });
  });
};

const readWriteByte = _ => {
  // Test writeByte & readByte
  // Enter continuous mode and verify that continuous mode has been entered
  i2c1.writeByte(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x0, err => {
    assert(!err, 'can\'t write byte to config');

    waitForWrite(_ => {
      i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, (err, config) => {
        assert(!err, 'can\'t read byte from config');
        assert(typeof config === 'number' && config <= 0xff, 'expeted readByte to read a byte');
        assert.strictEqual(config & 0x1, 0, 'continuous mode not eneterd');

        sendReceiveByte(config);
      });
    });
  });
};

const i2c1 = i2c.open(1, err => {
  assert(!err, 'can\'t open i2c bus');
  readWriteByte();
});


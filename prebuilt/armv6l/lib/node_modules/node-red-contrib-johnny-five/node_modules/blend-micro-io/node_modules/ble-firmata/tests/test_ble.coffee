process.env.NODE_ENV = 'test'

path   = require 'path'
assert = require 'assert'
async  = require 'async'

BLEFirmata = require path.resolve()

describe 'instance of BLEFirmata', ->

  arduino = new BLEFirmata()

  it 'should have method "connect"', ->
    assert.equal typeof arduino['connect'], 'function'


  it 'should have method "close"', ->
    assert.equal typeof arduino['close'], 'function'


  it 'should have method "isOpen"', ->
    assert.equal typeof arduino['isOpen'], 'function'


  it 'should emit "connect" event', (done) ->
    @timeout 10000
    arduino.connect()
    arduino.on 'connect', ->
      assert.equal arduino.isOpen(), true
      done()
    assert.equal arduino.isOpen(), false


  it 'should have property "boardVersion"', ->
    assert.ok arduino.boardVersion.match(/^\d+\.\d+$/)


  it 'should have method "pinMode"', ->
    assert.equal typeof arduino['pinMode'], 'function'


  it 'should have method "digitalWrite"', ->
    assert.equal typeof arduino['digitalWrite'], 'function'

  describe 'method "digitalWrite"', ->

    it 'output digital', ->
      for i in [0..13]
        arduino.digitalWrite(i, true)
        arduino.digitalWrite(i, false)


  it 'should have method "analogWrite"', ->
    assert.equal typeof arduino['analogWrite'], 'function'

  describe 'method "analogWrite"', ->

    it 'output analog', ->
      for i in [0..13]
        out = Math.random()*256
        arduino.analogWrite(i, out)
        arduino.analogWrite(i, out)


  it 'should have method "servoWrite"', ->
    assert.equal typeof arduino['servoWrite'], 'function'

  describe 'method "servoWrite"', ->

    it 'output servo angle', ->
      for i in [0..13]
        out = Math.random()*180
        arduino.servoWrite(i, out)
        arduino.servoWrite(i, out)


  it 'should have method "digitalRead"', ->
    assert.equal typeof arduino['digitalRead'], 'function'

  describe 'method "digitalRead"', ->

    it 'should return value true or false', ->
      for i in [0..13]
        stat = arduino.digitalRead(i)
        assert.ok ((stat is true) or (stat is false))


  it 'should have method "analogRead"', ->
    assert.equal typeof arduino['analogRead'], 'function'

  describe 'method "analogRead"', ->

    it 'should return value 0~1023', ->
      for i in [0..5]
        val = arduino.analogRead(i)
        assert.ok (0 <= val and val < 1024)


  it 'should have method "sysex"', ->
    assert.equal typeof arduino['sysex'], 'function'

  describe 'method "sysex"', ->

    it 'should send sysex command', (done) ->
      arduino.on 'sysex', (e) ->
        assert e.command, 0x01
        assert e.data, [0x01, 0, 3, 0, 2]
        done()
      arduino.sysex 0x01, [13,3,2]

  it 'should have method "sendI2CConfig"', ->
    assert.equal typeof arduino['sendI2CConfig'], 'function'

  describe 'method "sendI2CConfig"', ->

    it 'should send I2C config command', ->
      arduino.sendI2CConfig

  it 'should have method "sendI2CWriteRequest"', ->
    assert.equal typeof arduino['sendI2CWriteRequest'], 'function'

  describe 'method "sendI2CWriteRequest"', ->

    it 'should send I2C write request command', ->
      arduino.sendI2CWriteRequest 0x3D, [13,3,2]

  describe 'method "close"', ->

    it 'should close BLE connection', (done) ->
      arduino.close ->
        done()

'use strict';

var SerialPort = require('serialport').SerialPort;
var bindPhysical = require('../index').bindPhysical;
var mqtt = require('mqtt');

var SERIAL_PORT = process.env.SERIAL_PORT || '/dev/tty.usbmodem1421';

var serialPort = new SerialPort(SERIAL_PORT,{
    baudrate: 57600,
    buffersize: 1
});

var client = mqtt.connect('mqtt://127.0.0.1:1883');

bindPhysical({
  serialPort: serialPort,
  client: client,
  transmitTopic: 'serialClient',
  receiveTopic: 'physicalDevice'
});

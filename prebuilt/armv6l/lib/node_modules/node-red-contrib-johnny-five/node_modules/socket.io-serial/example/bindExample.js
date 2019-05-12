'use strict';

var SerialPort = require('serialport').SerialPort;
var bindPhysical = require('../index').bindPhysical;
var socketIoClient = require('socket.io-client');

var SERIAL_PORT = process.env.SERIAL_PORT || '/dev/tty.usbmodem1421';

var serialPort = new SerialPort(SERIAL_PORT,{
    baudrate: 57600,
    buffersize: 1
});

var client = socketIoClient('ws://localhost:3000');

bindPhysical({
  serialPort: serialPort,
  client: client,
  transmitTopic: 'serial',
  receiveTopic: 'physicalDevice',
  metaData: {device: 'serialClient'}
});

//make sure to get messages directed at me
client.emit('subscribe', 'physicalDevice', console.log);

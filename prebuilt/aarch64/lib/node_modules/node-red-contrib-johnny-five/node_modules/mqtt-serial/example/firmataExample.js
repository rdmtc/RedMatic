'use strict';

var mqtt = require('mqtt');
var VirtualSerialPort = require('../index').SerialPort;

var firmata = require('firmata');


var client = mqtt.connect('mqtt://127.0.0.1:1883');

var sp = new VirtualSerialPort({
  client: client,
  transmitTopic: 'physicalDevice',
  receiveTopic: 'serialClient'
});

var board = new firmata.Board(sp);
board.on('ready', function(){
  console.log('actually connected to an arduino!');
  board.digitalWrite(13, 1);
});




'use strict';

var VirtualSerialPort = require('../index').SerialPort;
var firmata = require('firmata');

var sp = new VirtualSerialPort({
  host: 'localhost',
  type: 'udp4',
  port: 41234
});

var board = new firmata.Board(sp, {reportVersionTimeout:1});
board.on('ready', function(){
  console.log('actually connected to an arduino!');
  board.digitalWrite(13, 1);
});



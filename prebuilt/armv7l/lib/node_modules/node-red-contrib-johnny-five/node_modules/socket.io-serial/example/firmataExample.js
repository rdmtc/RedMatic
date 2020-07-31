'use strict';

var socketIoClient = require('socket.io-client');
var VirtualSerialPort = require('../index').SerialPort;

var firmata = require('firmata');


var socket = socketIoClient('ws://localhost:3000');

var sp = new VirtualSerialPort({
  client: socket,
  transmitTopic: 'serial',
  receiveTopic: 'serialClient',
  metaData: {device: 'physicalDevice'}
});

//make sure to get messages directed at me
socket.emit('joinchannel', 'serialClient', function(resp){
  console.log(resp);

  // have a ready serial port, do something with it:
  var board = new firmata.Board(sp);
  board.on('ready', function(){
    console.log('actually connected to an arduino!');
    board.digitalWrite(13, 1);
  });

});




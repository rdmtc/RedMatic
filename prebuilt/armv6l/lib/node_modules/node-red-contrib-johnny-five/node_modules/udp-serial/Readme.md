udp-serial
=============

A virtual [node-serialport](https://github.com/voodootikigod/node-serialport) implementation that uses UDP/dgram as the transport.


# Installation

`npm install udp-serial`

# UDPSerialPort

Use UDP/dgram to send/receive data to a remote physical device:

```js
'use strict';

var VirtualSerialPort = require('udp-serial').SerialPort;
var firmata = require('firmata');

//create the udp serialport and specify the host and port to connect to
var sp = new VirtualSerialPort({
  host: 'localhost',
  type: 'udp4',
  port: 41234
});

//use the serial port to send a command to a remote firmata(arduino) device
var board = new firmata.Board(sp);
board.on('ready', function(){
  console.log('actually connected to an arduino!');
  board.digitalWrite(13, 1);
});

```


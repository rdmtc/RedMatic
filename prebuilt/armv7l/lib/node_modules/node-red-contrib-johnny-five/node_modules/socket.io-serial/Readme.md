socket.io-serial
=============

A virtual [node-serialport](https://github.com/voodootikigod/node-serialport) implementation that uses socket.io as the transport.

# Installation

```
npm install socket.io-serial
```

# SocketSerialPort

Use socket.io to send/receive data to a remote physical device:

```js
var SocketSerialPort = require('socket.io-serial').SerialPort;
var io = require('socket.io-client');
var firmata = require('firmata');

// setup the socket.io client
var client = io('http://localhost');

//create the socket.io serialport and specify the send and receive topics
var serialPort = new SocketSerialPort({
  client: client,
  transmitTopic: 'REPLACE WITH YOUR TRANSMIT TOPIC',
  receiveTopic: 'REPLACE WITH YOUR RECEIVE TOPIC'
});

//use the virtual serial port to send a command to a firmata device
var board = new firmata.Board(serialPort, function (err, ok) {
  if (err){ throw err; }
  //light up a pin
  board.digitalWrite(13, 1);
});

```


# bindPhysical

Bind a physical serial port to receive/send data from a socket.io server:

```js
var SerialPort = require('serialport').SerialPort;
var bindPhysical = require('socket.io-serial').bindPhysical;
var skynet = require('socket.io-client');

// setup the socket.io client
var client = io('http://localhost');

// setup a connection to a physical serial port
var serialPort = new SerialPort('/dev/tty.usbmodem1411',{
    baudrate: 57600,
    buffersize: 1
});

//connects the physical device to a socket.io server
bindPhysical({
  serialPort: serialPort,
  client: client,
  transmitTopic: 'REPLACE WITH YOUR TRANSMIT TOPIC',
  receiveTopic: 'REPLACE WITH YOUR RECEIVE TOPIC'
});

```

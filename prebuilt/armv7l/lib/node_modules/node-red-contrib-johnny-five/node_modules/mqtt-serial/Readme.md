mqtt-serial
=============

A virtual [node-serialport](https://github.com/voodootikigod/node-serialport) implementation that uses MQTT as the transport.


# MQTTSerialPort

Use mqtt to send/receive data to a remote physical device:

```js
var MQTTSerialPort = require('mqtt-serial').SerialPort;
var mqtt = require('mqtt');
var firmata = require('firmata');

// setup the mqtt client with port, host, and optional credentials
var client = mqtt.connect('mqtt://127.0.0.1:1883', {username: 'A USER', password: 'A PASSWORD'});

//create the mqtt serialport and specify the send and receive topics
var serialPort = new MQTTSerialPort({
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

Bind a physical serial port to receive/send data from an mqtt server:

```js
var SerialPort = require('serialport').SerialPort;
var bindPhysical = require('mqtt-serial').bindPhysical;
var skynet = require('mqtt');

// setup the mqtt client with port, host, and optional credentials
var client = mqtt.connect('mqtt://127.0.0.1:1883', {username: 'A USER', password: 'A PASSWORD'});

// setup a connection to a physical serial port
var serialPort = new SerialPort('/dev/tty.usbmodem1411',{
    baudrate: 57600,
    buffersize: 1
});

//connects the physical device to an mqtt server
bindPhysical({
  serialPort: serialPort,
  client: client,
  transmitTopic: 'REPLACE WITH YOUR TRANSMIT TOPIC',
  receiveTopic: 'REPLACE WITH YOUR RECEIVE TOPIC'
});

```

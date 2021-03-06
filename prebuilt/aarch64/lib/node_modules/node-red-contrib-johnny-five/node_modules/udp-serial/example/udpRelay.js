var SerialPort = require('serialport').SerialPort;
var dgram = require("dgram");

var server = dgram.createSocket("udp4");

//possibly something like COM1 on windows
var SERIAL_PORT = process.env.SERIAL_PORT || '/dev/tty.usbmodem1421';
var PORT = process.env.PORT || 41234;

var serialPort = new SerialPort(SERIAL_PORT,{
    baudrate: 57600,
    buffersize: 1
});

var connectedClient, connectedPort;

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});

server.on("message", function (msg, rinfo) {

  //this only handles one client at a time.
  connectedClient = rinfo.address;
  connectedPort = rinfo.port;

  console.log("server got: " + msg.toString('hex') + " from " +
    rinfo.address + ":" + rinfo.port, msg.length);
  serialPort.write(msg);
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

serialPort.on('data', function(data){
  console.log('from serial', data.toString('hex'));
  if(connectedClient && connectedPort){
    server.send(data, 0, data.length, connectedPort, connectedClient);
  }
});

server.bind(PORT);

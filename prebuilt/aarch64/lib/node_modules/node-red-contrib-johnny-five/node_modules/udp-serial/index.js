'use strict';

var util = require('util');
var stream = require('stream');
var dgram = require('dgram');


function UDPSerialPort(options) {
  options = options || {};
  this.type = options.type || 'udp4';
  this.host = options.host || 'localhost';
  this.port = options.port || 41234;

  var self = this;

  self.client = dgram.createSocket(self.type);

  self.client.on('message', function(data, rinfo){
    try{
      self.emit('data', data);

    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });

  self.client.on('listening', function(){
    //needed for nodebots/johnny-five
    self.emit('open');
  });

}

util.inherits(UDPSerialPort, stream.Stream);


UDPSerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};



UDPSerialPort.prototype.write = function (data, callback) {

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  this.client.send(data, 0, data.length, this.port, this.host, function(err) {
    if(err){
      console.log('error sending data', err);
    }
  });

};



UDPSerialPort.prototype.close = function (callback) {
  console.log('closing');
  if(this.client){
    this.client.close();
  }
  if(callback){
    callback();
  }
};

UDPSerialPort.prototype.flush = function (callback) {
  console.log('flush');
  if(callback){
    callback();
  }
};

UDPSerialPort.prototype.drain = function (callback) {
  console.log('drain');
  if(callback){
    callback();
  }
};


module.exports = {
  SerialPort: UDPSerialPort
};

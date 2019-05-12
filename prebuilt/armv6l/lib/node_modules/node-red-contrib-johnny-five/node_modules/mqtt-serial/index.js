'use strict';

var util = require('util');
var stream = require('stream');


function MQTTSerialPort(options) {
  this.client = options.client;
  this.receiveTopic = options.receiveTopic;
  this.transmitTopic = options.transmitTopic;
  this.qos = options.qos || 0;

  this.buffer = null;
  this.lastCheck = 0;
  this.lastSend = 0;
  this.base64 = options.base64 || false;

  var self = this;

  this.client.subscribe(this.receiveTopic, {qos: this.qos});

  this.emit('open');

  this.client.on('message', function(topic, data){
    try{
      if(topic === self.receiveTopic){
        if(self.base64){
          self.emit('data', new Buffer(data.toString(), 'base64'));
        }else{
          self.emit('data', data);
        }
      }

    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });

}

util.inherits(MQTTSerialPort, stream.Stream);


MQTTSerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};



MQTTSerialPort.prototype.write = function (data, callback) {


  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  if(this.base64){
    data = data.toString('base64');
  }

  this.client.publish(this.transmitTopic, data, {qos: this.qos});
};



MQTTSerialPort.prototype.close = function (callback) {
  console.log('closing');
  if(this.client){
    this.client.end();
  }
  if(callback){
    callback();
  }
};

MQTTSerialPort.prototype.flush = function (callback) {
  console.log('flush');
  if(callback){
    callback();
  }
};

MQTTSerialPort.prototype.drain = function (callback) {
  console.log('drain');
  if(callback){
    callback();
  }
};


function bindPhysical(options){
  var client = options.client;
  var serialPort = options.serialPort;
  var receiveTopic = options.receiveTopic;
  var transmitTopic = options.transmitTopic;
  var qos = options.qos || 0;
  var useBase64 = options.base64 || false;

  function serialWrite(data){
    try{
      if(useBase64){
        data = new Buffer(data.toString(), 'base64');
      }
      console.log('writing to serialPort', data);
      serialPort.write(data);
    }catch(exp){
      console.log('error reading message', exp);
    }
  }

  client.subscribe(receiveTopic, {qos: qos});

  serialPort.on('data', function(data){
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }

    if(useBase64){
      data = data.toString('base64');
    }

    client.publish(transmitTopic, data, {qos: qos});
  });


  client.on('message', function(topic, data, packet){
    try{
      if(topic === receiveTopic){
        serialWrite(data);
      }
    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });


}


module.exports = {
  SerialPort: MQTTSerialPort,
  bindPhysical: bindPhysical
};

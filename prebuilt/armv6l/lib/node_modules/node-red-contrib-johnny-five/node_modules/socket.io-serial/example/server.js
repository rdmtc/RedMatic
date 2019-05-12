'use strict';

var Server = require('socket.io');
var io = new Server(3000);

io.on('connection', function(socket){

  socket.on('serial', function(msg){
    if(typeof msg.device === 'string'){
      //psuedo private message another client
      io.emit(msg.device, msg);
    }
  });

  socket.on('joinchannel', function(channel, callback){
    try{
      socket.join(channel);
      if(callback){
        callback('joined ' + channel);
      }
      console.log('joined', channel);
    }catch(exp){
      console.log('error joining', channel, exp);
    }
  });

  socket.on('leavechannel', function(channel, callback){
    try{
      socket.leave(channel);
      if(callback){
        callback('left ' + channel);
      }
      console.log('left', channel);
    }catch(exp){
      console.log('error leaving', channel, exp);
    }
  });

});

console.log('server ready');

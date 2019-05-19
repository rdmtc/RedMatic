var Particle = require("../lib/particle");
var board = new Particle({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_DEVICE_ID
});

board.on("ready", function() {
  console.log("CONNECTED");

  this.analogRead("A0", function(data) {
    console.log( "A0",  data );
  });

});

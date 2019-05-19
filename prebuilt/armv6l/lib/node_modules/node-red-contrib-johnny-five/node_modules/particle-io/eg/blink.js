var Particle = require("../lib/particle");
var board = new Particle({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_PHOTON_1
});

board.on("ready", function() {
  console.log("CONNECTED");

  var byte = 0;

  this.pinMode("D7", this.MODES.OUTPUT);

  setInterval(function() {
    this.digitalWrite("D7", (byte ^= 1));
  }.bind(this), 500);
});

board.on("error", function(error) {
  console.log(error);
});


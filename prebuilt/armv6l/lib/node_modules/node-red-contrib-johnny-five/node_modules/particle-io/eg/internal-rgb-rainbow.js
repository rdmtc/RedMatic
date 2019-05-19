var Particle = require("../lib/particle");
var board = new Particle({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_DEVICE_ID
});

board.on("ready", function() {
  var rainbow = ["FF0000", "FF7F00", "00FF00", "FFFF00", "0000FF", "4B0082", "8F00FF"];
  var index = 0;

  setInterval(function() {
    if (index + 1 === rainbow.length) {
      index = 0;
    }
    this.internalRGB(rainbow[index++]);
  }.bind(this), 500);
});

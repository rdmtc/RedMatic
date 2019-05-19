var Particle = require("../lib/particle");
var board = new Particle({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_DEVICE_BLACK
});

board.on("ready", function() {
  console.log("CONNECTED");

  var pins = [
    "A0",
    "A1"
  ];

  pins.forEach(function(pin) {
    this.pinMode(pin, this.MODES.INPUT);
    this.analogRead(pin, function(data) {
      console.log(pin,  data);
    });
  }, this);
});

var five = require("johnny-five"),
  Particle = require("../lib/particle"),
  board;

// Create Johnny-Five board connected via Particle
board = new five.Board({
  io: new Particle({
    token: process.env.PARTICLE_TOKEN,
    deviceId: process.env.PARTICLE_DEVICE_ID
  })
});

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  console.log("CONNECTED");

  // Once connected, we can do normal Johnny-Five stuff
  var led = new five.Led("D7");

  led.blink();

});

board.on("error", function(error) {
  console.log(error);
});

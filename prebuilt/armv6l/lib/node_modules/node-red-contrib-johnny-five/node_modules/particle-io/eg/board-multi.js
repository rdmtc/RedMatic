var five = require("johnny-five"),
  Particle = require("../lib/Particle"),
  board;

// Define array of available cores with appropriate DEVICE_IDs for each.
// Note that the five.Boards(["ID1","ID2"]) shorthand doesn't work for
// particle-io because we have to pass the io configuration object.
// The five.Boards port option is also not applicable here.
var cores = [
  {
    id: "A",
    io: new Particle({
      token: process.env.PARTICLE_TOKEN,
      deviceId: process.env.PARTICLE_DEVICE_ID_A
    })
  },{
    id: "B",
    io: new Particle({
      token: process.env.PARTICLE_TOKEN,
      deviceId: process.env.PARTICLE_DEVICE_ID_B,
    })
  }
];

// Create 2 particle board instances
new five.Boards(cores).on("ready", function() {

  // Both "A" and "B" are initialized
  // (connected and available for communication)

  // |this| is an array-like object containing references
  // to each initialized board.
  this.each(function(board) {

    // Initialize an Led instance on default D7 LED of
    // each initialized particle and strobe it.
    new five.Led({
      pin: "D7",
      board: board
    }).strobe();

  });
  
});
var five = require("johnny-five");
var Imp = require("../");
var board = new five.Board({
  io: new Imp({
    agent: process.env.IMP_AGENT_2
    // agent: "invalid"
  })
});

board.on("ready", function() {
  var led = new five.Led(9);
  led.on();
});

var Imp = require("../");
var board = new Imp({
  agent: process.env.IMP_AGENT,
  type: ("imp001" || "April")
});

board.on("ready", function() {
  console.log("connected!");
  this.pinMode(2, this.MODES.PWM);
  this.analogWrite(2, 10);

  this.pinMode(9, this.MODES.ANALOG);
  this.analogRead(9, function(data) {
    console.log(data);
  });
});

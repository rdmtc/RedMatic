var Photon = require("../lib/particle");
var board = new Photon({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_PHOTON_1,
});

board.on("ready", function() {
  console.log("READY");

  var continuousRead = function() {
    this.pingRead({ pin: "D3" }, function(duration) {
      console.log(duration);

      setTimeout(continuousRead, 65);
    });
  }.bind(this);

  continuousRead();
});

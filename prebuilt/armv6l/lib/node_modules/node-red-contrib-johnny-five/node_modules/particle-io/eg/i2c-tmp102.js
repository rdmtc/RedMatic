var Photon = require("../lib/particle");
var board = new Photon({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_PHOTON_1
});

board.on("ready", function() {
  console.log("READY");

  this.i2cConfig();

  this.i2cRead(0x48, 2, function(data) {
    var raw = ((data[0] << 8) | data[1]) >> 4;

    if (raw & (1 << 11)) {
      raw |= 0xF800; // Set bits 11 to 15 to 1s to get this reading into real twos compliment
    }

    raw = raw >> 15 ? ((raw ^ 0xFFFF) + 1) * -1 : raw;

    console.log(raw / 16);
  });
});

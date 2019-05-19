var moment = require("moment");
var Particle = require("../lib/particle");
var board = new Particle({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_DEVICE_ROBOTSCONF
});

// node eg/crash-test.js
// node eg/crash-test.js 8 100 digital

var count = process.argv[2] || 8;
var interval = process.argv[3] || 100;
var type = process.argv[4] || "digital";

console.log(count, interval, type);
board.on("ready", function() {
  console.log("CONNECTED");

  this.setSamplingInterval(interval);

  var prefix = type[0].toUpperCase();
  var mode = type === "analog" ? "ANALOG" : "INPUT";
  var values = Array.from({length: count });
  var last = Date.now();


  Array.from({ length: count }, function(_, i) { return prefix + i; }).forEach(function(pin) {
    this.pinMode(pin, this.MODES[mode]);
    this[type + "Read"](pin, function(data) {
      // console.log(pin, data);

      var now = Date.now();

      values[Number(pin.replace(prefix, ""))] = data;

      if (pin === (prefix + "7") && now > last + 1000) {
        last = now;
        console.log(values);
        console.log(moment(now).format("hh:mm:ss"), now);
      }

    });
  }, this);
});

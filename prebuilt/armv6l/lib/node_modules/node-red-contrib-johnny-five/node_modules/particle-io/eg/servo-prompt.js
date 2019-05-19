var Particle    = require('../lib/particle');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


var board = new Particle({
  token: process.env.PARTICLE_TOKEN,
  deviceId: process.env.PARTICLE_DEVICE_ID
});

board.on('ready', function() {

  this.pinMode('D0', this.MODES.SERVO);

  rl.setPrompt('SERVO TEST (0-180)> ');
  rl.prompt();

  rl.on('line', function(line) {
    var pos = line.trim();
    board.servoWrite("D0", pos);
    rl.prompt();
  }).on('close', function() {
    process.exit(0);
  });

});

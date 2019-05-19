# Servo Prompt

Run with:
``` bash
node eg/servo-prompt.js
```


``` javascript
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

```


## Breadboard/Illustration


![docs/breadboard/servo.png](breadboard/servo.png)
[docs/breadboard/servo.fzz](breadboard/servo.fzz)





## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
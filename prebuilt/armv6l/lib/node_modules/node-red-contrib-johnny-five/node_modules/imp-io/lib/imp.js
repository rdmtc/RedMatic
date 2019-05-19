// Global Deps
require("es6-shim");

// The const caps are used to illustrate the "const-ness"
// of the value, but the binding is not const.
var IS_TEST_MODE = global.IS_TEST_MODE || false;
var request = require("request");
var Emitter = require("events").EventEmitter;
var temporal = require("temporal");


// Shareds
var priv = new Map();
var tick = global.setImmediate || process.nextTick;
var boards = [];
var reporting = [];
var message = {
  payload: "",
  report: ""
};

var pinModes = [
  { modes: [] },
  { modes: [0, 1, 2, 3, 4], analogChannel: 1 },
  { modes: [0, 1, 2, 3, 4], analogChannel: 2 },
  { modes: [] },
  { modes: [] },
  { modes: [0, 1, 2, 3, 4], analogChannel: 5 },
  { modes: [] },
  { modes: [0, 1, 2, 3, 4], analogChannel: 7 },
  { modes: [0, 1, 2, 3, 4], analogChannel: 8 },
  { modes: [0, 1, 2, 3, 4], analogChannel: 9 },
];

// const caps are illustrative only
var PIN_MODE = 0xF4;
var ANALOG_WRITE = 0xE0;
var SERVO_WRITE = 0xE1;
var SERVO_CONFIG = 0x70;
var DIGITAL_WRITE = 0x90;
var REPORT_ANALOG = 0xC0;
var REPORT_DIGITAL = 0xD0;
var SYSTEM_RESET = 0xFF;

var modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
});

var url = "https://agent.electricimp.com/";

function read() {
  var bytes = [];

  if (read.isReading) {
    return;
  }
  if (!read.samplingInterval) {
    read.samplingInterval = 10;
  }

  if (!boards.length || !reporting.length) {
    tick(read);
    return;
  }

  read.isReading = true;
  read.interval = setInterval(function() {
    var board, agent;

    if (boards.length && reporting.length) {
      board = boards[0];
      agent = priv.get(board).agent;

      var flag = 0;
      var index = null;

      bytes.forEach(function(byte) {
        if (flag === 0) {
          index = byte;
        } else {
          processRead(board, reporting[index], byte);
        }
        flag = flag ^ 1;
      });
    }
  }, read.samplingInterval);

  var time = Date.now();

  function readRequest() {
    var now = Date.now();
    var board, agent;

    if (now < time + read.samplingInterval) {
      now = time;
      tick(readRequest);
    } else {
      if (boards.length && reporting.length) {
        board = boards[0];
        agent = priv.get(board).agent;

        request(url + agent, function(err, response, body) {
          if (body.endsWith(",")) {
            body = body.slice(0, -1);
          }

          bytes = toBytes(body);
          readRequest();
        });
      }
    }
  }
  readRequest();
}

function processRead(board, report, value) {
  value = +value;

  if (Number.isNaN(value)) {
    value = 0;
  }

  if (report.scale) {
    value = report.scale(value);
  }

  board.pins[report.index].value = value;
  board.emit(report.event, value);
}


function Imp(opts) {
  Emitter.call(this);

  if (!(this instanceof Imp)) {
    return new Imp(opts);
  }

  opts = opts || {};

  this.type = opts.type || "imp001";

  var awaiting = [];
  var state = {
    i2c: null,
    agent: opts.agent
  };

  priv.set(this, state);

  // TODO: this should be derived from board information
  this.name = "Electric Imp April (IMP001)";
  this.isReady = false;

  this.pins = pinModes.map(function(config, index) {
    config.addr = index;
    config.agent = opts.agent;

    return new Pin(config);
  }, this);

  // All pins are analog pins
  this.analogPins = this.pins.slice().map(function(_, i) {
    return i;
  });

  boards.push(this);

  // Send a SYSTEM_RESET command to verify
  // connection and reset the device state.
  //
  write(state.agent, "payload", [SYSTEM_RESET], function(err, response, body) {

    if (response.statusCode !== 200) {
      //
      // Anything but successful response is a failure.
      //

      var failure = [
            (response.statusCode + " " + body).red
          ];

      if (state.agent) {
        failure.push(
          "Failed to connect to Electric Imp with Agent ID: " + state.agent.yellow,
          "Verify that the correct Agent ID has been provided.",
          ""
        );
      } else {
        failure.push(
          "Agent ID not found."
        );
      }

      throw new Error(failure.join("\n"));
    } else {
      //
      // Successfully connected to an active Electric Imp
      //
      process.nextTick(function() {
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");

        var isLocked = false;
        var unlockAt = 0;

        // Set up async commincation loop
        temporal.loop(10, function() {

          if (isLocked && this.calledAt > unlockAt) {
            isLocked = false;
          }

          ["payload", "report"].forEach( function(type) {
            if (message[type] !== "" && !(isLocked)) {
              write(state.agent, type, message[type]);
              message[type] = "";
              isLocked = true;
              unlockAt = this.calledAt + 100;
            }
          }, this);
        });
      }.bind(this));
    }
  }.bind(this));
}


Imp.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Imp
  },
  MODES: {
    value: modes
  },
  HIGH: {
    value: 1
  },
  LOW: {
    value: 0
  }
});


Imp.prototype.pinMode = function(pin, mode) {
  var pinIndex = toPinIndex(pin);

  if (pinIndex >= this.pins.length ||
      (this.pins[pinIndex] && this.pins[pinIndex].supportedModes.length === 0)) {
    throw new Error("Invalid pin: " + pin);
  }

  this.pins[toPinIndex(pin)].mode = +mode;
  return this;
};

Imp.prototype.analogRead = function(pin, handler) {

  var state = priv.get(this);
  var pinIndex;
  var gpio;
  var alias;
  var event;

  pinIndex = toPinIndex(pin);
  gpio = this.pins[pinIndex].gpio;
  alias = this.pins[pinIndex].analogChannel;
  event = "analog-read-" + alias;

  if (this.pins[pinIndex].mode !== this.MODES.ANALOG) {
    this.pinMode(pin, this.MODES.ANALOG);
  }

  reporting[pinIndex] = {
    event: event,
    index: pinIndex
  };

  enqueue(state.agent, "report", [REPORT_ANALOG, pinIndex]);

  this.on(event, handler);

  if (IS_TEST_MODE) {
    // Kickstart the read interval
    read();
  }

  return this;
};

Imp.prototype.digitalRead = function(pin, handler) {
  var state = priv.get(this);
  var pinIndex = toPinIndex(pin);
  var gpio = this.pins[pinIndex].gpio;
  var event = "digital-read-" + pinIndex;

  if (this.pins[pinIndex].mode !== this.MODES.INPUT) {
    this.pinMode(pin, this.MODES.INPUT);
  }

  reporting[pinIndex] = {
    event: event,
    index: pinIndex
  };

  enqueue(state.agent, "report", [REPORT_DIGITAL, pin]);

  this.on(event, handler);

  if (IS_TEST_MODE) {
    // Kickstart the read interval
    read();
  }

  return this;
};

Imp.prototype.analogWrite = function(pin, value) {
  var pinIndex = toPinIndex(pin);

  if (this.pins[pinIndex].mode !== this.MODES.PWM) {
    this.pinMode(pin, this.MODES.PWM);
  }

  this.pins[pinIndex].value = value;
  this.pins[pinIndex].write(value);

  return this;
};

Imp.prototype.digitalWrite = function(pin, value) {
  var pinIndex = toPinIndex(pin);

  if (this.pins[pinIndex].mode !== this.MODES.OUTPUT) {
    this.pinMode(pin, this.MODES.OUTPUT);
  }

  this.pins[pinIndex].value = value > 0 ? 1 : 0;
  this.pins[pinIndex].write(value);

  return this;
};

Imp.prototype.servoConfig = function(pin, min, max) {
  
  var state = priv.get(this);
  var temp;
  
    if (typeof pin === "object" && pin !== null) {
      temp = pin;
      pin = temp.pin;
      min = temp.min;
      max = temp.max;
    }
  
    if (typeof pin === "undefined") {
      throw new Error("servoConfig: pin must be specified");
    }
  
    if (typeof min === "undefined") {
      throw new Error("servoConfig: min must be specified");
    }
  
    if (typeof max === "undefined") {
      throw new Error("servoConfig: max must be specified");
    }
  
    var pinIndex = toPinIndex(pin);

    if (this.pins[pinIndex].mode !== this.MODES.SERVO) {
      this.pinMode(pin, this.MODES.SERVO);
    }

    state.pwm.servoMin = min;
    state.pwm.servoMax = max;
    
    enqueue(state.agent, "payload", [SERVO_CONFIG, pin, min, max]);

};

Imp.prototype.servoWrite = function(pin, value) {
  var pinIndex = toPinIndex(pin);

  if (this.pins[pinIndex].mode !== this.MODES.SERVO) {
    this.pinMode(pin, this.MODES.SERVO);
  }

  this.pins[pinIndex].value = value;
  this.pins[pinIndex].write(value);

  return this;
};


// TODO...
Imp.prototype.i2cWrite = function() {

};

Imp.prototype.i2cRead = function() {

};

Imp.prototype.pulseIn = function() {

};

Imp.prototype.setSamplingInterval = function(ms) {
  read.samplingInterval = Math.min(Math.max(ms, 0), 65535);
  clearInterval(read.interval);
  read();
};

function Pin(opts) {
  Emitter.call(this);

  var awaiting = [];
  var isDigital = typeof opts.analogChannel !== "number";
  var isAnalog = !isDigital;
  var state = {
    addr: opts.addr,
    agent: opts.agent,
    mode: isAnalog ? 2 : 1,
    isPwm: false,
    gpio: {
      //  Digital Analog Specific
      value: null,
    },
    pwm: {
      // PWM/Servo specific
      // Numeric values are in nanoseconds
      duty: 0,
      period: 0,
      resolution: 0,
      servoMin: 600,
      servoMax: 2400
    }
  };

  Object.assign(state, opts);

  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return state.gpio.value;
      },
      set: function(value) {
        state.gpio.value = value;
      }
    },
    mode: {
      get: function() {
        return state.mode;
      },
      set: function(mode) {
        enqueue(state.agent, "payload", [PIN_MODE, state.addr, mode]);
        state.mode = mode;
      }
    },
    isPwm: {
      get: function() {
        return state.mode === 3 || state.mode === 4;
      }
    },
    supportedModes: {
      enumerable: true,
      value: opts.modes
    },
    addr: {
      get: function() {
        return state.addr;
      }
    },
    agent: {
      get: function() {
        return state.agent;
      }
    }
  });

  if (typeof opts.analogChannel === "number") {
    this.analogChannel = opts.analogChannel;
  }
}

Pin.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Pin
  }
});

Pin.prototype.write = function(value) {
  var state = priv.get(this);
  var data = [];
  var command;

  if (state.mode === 1) {
    command = DIGITAL_WRITE;
  }

  if (state.mode === 3) {
    command = ANALOG_WRITE;
  }

  if (state.mode === 4) {
    command = SERVO_WRITE;
  }

  if (Array.isArray(value)) {
    value.forEach(function(val) {
      var encoded = to7BitArray(val);
      data.push(encoded[0], encoded[1]);
    });
  } else {
    data = [to7BitArray(value)];
  }

  enqueue(state.agent, "payload", [command, state.addr].concat(data));
};

function enqueue(agent, type, data, callback) {
  message[type] += message[type] === "" ? data : "|" + data;
}

function write(agent, type, data, callback) {
  var remote = url + agent;
  var address = remote + "?" + type + "=" + data;

  var start = Date.now();
  request(address, function(err, response, body) {
    if (typeof callback === "function") {
      callback(err, response, body);
    }
  });
}

function to7BitArray(value) {
  return [value & 0x7f, value >> 0x07 & 0x7f];
}

function toBytes(data) {
  return (data || "").trim().split(",").map(Number);
}

function toPinIndex(pin) {
  return (String(pin).replace("pin", "") | 0);
}

function scale(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) /
    (inMax - inMin) + outMin;
}

function constrain(value, min, max) {
  return value > max ? max : value < min ? min : value;
}

function noop() {}

if (IS_TEST_MODE) {
  Imp.__message = message;
  Imp.__enqueue = enqueue;
  Imp.__read = read;
  Imp.__write = write;
  Imp.__Pin = Pin;
  Imp.reset = function() {
    boards.length = 0;
    reporting.length = 0;
    read.isReading = false;
    read.samplingInterval = 1;
    message.payload = "";
    message.report = "";
    clearInterval(read.interval);
    priv.clear();
  };
} else {
  read();
}

module.exports = Imp;

require("es6-shim");
require("array-includes").shim();

var net = require("net");
var Emitter = require("events").EventEmitter;
var https = require("https");
var priv = new Map();

var errors = {
  cloud: "Unable to connect to particle cloud.",
  firmware: "Unable to connect to the voodoospark firmware, has it been loaded?",
  instance: "Expected instance of Particle.",
  pwm: "PWM is only available on D0, D1, A0, A1, A4, A5, A6, A7"
};

var pins = [
  { id: "D0", modes: [0, 1, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "D1", modes: [0, 1, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "D2", modes: [0, 1, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "D3", modes: [0, 1, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "D4", modes: [0, 1] },
  { id: "D5", modes: [0, 1] },
  { id: "D6", modes: [0, 1] },
  { id: "D7", modes: [0, 1] },

  { id: "", modes: [] },
  { id: "", modes: [] },

  { id: "A0", modes: [0, 1, 2, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "A1", modes: [0, 1, 2, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "A2", modes: [0, 1, 2] },
  { id: "A3", modes: [0, 1, 2] },
  { id: "A4", modes: [0, 1, 2, 3, 4], pwm: { servoMin: 1000, servoMax: 2000 }},
  { id: "A5", modes: [0, 1, 2, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "A6", modes: [0, 1, 2, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
  { id: "A7", modes: [0, 1, 2, 3, 4], pwm: { servoMin: 600, servoMax: 2400 }},
];

var modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4,
  I2C: 6
});

var modesMap = [
  "INPUT",
  "OUTPUT",
  "ANALOG",
  "PWM",
  "SERVO",
  "I2C"
];

var DIGITAL_READ = 0x03;
var ANALOG_READ = 0x04;
var REPORTING = 0x05;
var SAMPLE_INTERVAL = 0x06;
var INTERNAL_RGB = 0x07;
var I2C_CONFIG = 0x30;
var I2C_WRITE = 0x31;
var I2C_READ = 0x32;
var I2C_READ_CONTINUOUS = 0x33;
var I2C_REGISTER_NOT_SPECIFIED = 0xFF;
var I2C_REPLY = 0x77;
var PING_READ = 0x08;

function service(token, deviceId, action) {
  var url = "https://api.particle.io/v1/devices";

  if (deviceId) {
    url += "/" + deviceId;

    if (action) {
      url += "/" + action;
    }
  }

  url += "?access_token=" + token;

  return url;
}

function from7BitBytes(lsb, msb) {
  if (Array.isArray(lsb)) {
    msb = lsb[1];
    lsb = lsb[0];
  }
  var result = lsb | (msb << 0x07);
  return result >= 16383 ? -1 : result;
}

function to7BitBytes(value) {
  return [value & 0x7f, value >> 0x07 & 0x7f];
}


function processReceived(board, data) {
  var dlength = data.length;
  var length, action, pin, pinName, pinIndex, port,
      lsb, msb, value, portValue, type, event,
      dataLength, i2cData, address, register;

  for (var i = 0; i < dlength; i++) {
    board.buffer.push(data.readUInt8(i));
  }

  length = board.buffer.length;

  if (length >= 4) {

    while (length) {
      action = board.buffer.shift();

      // Digital reads are allowed to be
      // reported on Analog pins
      //
      if (action === REPORTING) {
        pin = board.buffer.shift();
        lsb = board.buffer.shift();
        msb = board.buffer.shift();

        value = from7BitBytes(lsb, msb);

        port = +pin;
        portValue = +value;

        for (var k = 0; k < 8; k++) {
          pinIndex = k + (10 * port);
          event = "digital-read-" + (port ? "A" : "D") + k;
          value = portValue & (1 << k) ? 1 : 0;

          if (typeof board._events[event] !== "undefined" &&
              board.pins[pinIndex].value !== value) {
            board.pins[pinIndex].value = value;
            board.emit(event, value);
          }
        }
      }

      if (action === DIGITAL_READ ||
          action === ANALOG_READ) {
        pin = board.buffer.shift();
        lsb = board.buffer.shift();
        msb = board.buffer.shift();

        value = from7BitBytes(lsb, msb);

        if (action === ANALOG_READ) {
          pinName = "A" + (pin - 10);
          type = "analog";

          // This shifts the value 2 places to the left
          // for compatibility with firmata's 10-bit ADC
          // analog values. In the future it might be nice
          // to allow some
          value >>= 2;
        }

        if (action === DIGITAL_READ) {
          pinName = "D" + pin;
          type = "digital";
        }

        event = type + "-read-" + pinName;

        board.pins[pin].value = value;
        board.emit(event, value);
      }

      if (action === PING_READ) {
        pin = board.buffer.shift();
        value = (board.buffer.shift() << 24) +
                (board.buffer.shift() << 16) +
                (board.buffer.shift() << 8) +
                board.buffer.shift();

        pinName = "D" + pin;

        board.pins[pin].value = value;
        board.emit("ping-read-" + pin, value);
      }

      if (action === I2C_REPLY) {
        dataLength = board.buffer.shift();
        address = board.buffer.shift();
        lsb = board.buffer.shift();
        msb = board.buffer.shift();

        register = from7BitBytes(lsb, msb);

        event = "I2C-reply-" + address;

        if (register !== I2C_REGISTER_NOT_SPECIFIED) {
          event += "-" + register;
        }

        i2cData = [];
        for (i = 0; i < dataLength; i++) {
          i2cData.push(board.buffer.shift());
        }

        board.emit(event, i2cData);
      }

      length = board.buffer.length;
    }
  }
}

function startReading(state) {
  if (!state.isReading) {
    state.isReading = true;
    state.socket.on("data", function(data) {
      processReceived(this, data);
    }.bind(this));
  }
}

function Particle(opts) {
  Emitter.call(this);

  if (!(this instanceof Particle)) {
    return new Particle(opts);
  }

  var state = {
    isConnected: false,
    isReading: false,
    deviceId: opts.deviceId,
    deviceName: opts.deviceName,
    token: opts.token,
    host: opts.host || null,
    port: opts.port || 8001,
    client: null,
    socket: null,
    rgb: {
      red: null,
      green: null,
      blue: null
    }
  };

  this.name = "particle-io";
  this.buffer = [];
  this.isReady = false;

  this.pins = pins.map(function(pin) {
    return {
      name: pin.id,
      supportedModes: pin.modes,
      mode: pin.modes[0],
      pwm: pin.pwm,
      value: 0
    };
  });

  this.analogPins = this.pins.slice(10).map(function(pin, i) {
    return i;
  });

  // Store private state
  priv.set(this, state);

  var afterCreate = function(error) {
    if (error) {
      this.emit("error", error);
    } else {
      state.isConnected = true;
      this.emit("connect");
    }
  }.bind(this);

  if (state.host && state.port) {
    setTimeout(function() {
      Particle.Client.create(this, afterCreate);
    }.bind(this), 0);
  } else {
    this.connect(function(error, data) {
      // console.log( "connect -> connect -> handler" );

      if (error !== undefined && error !== null) {
        this.emit("error", error);
      } else if (data.cmd !== "VarReturn") {
        this.emit("error", errors.firmware);
      } else {
        var address = data.result.split(":");
        state.host = address[0];
        state.port = parseInt(address[1], 10);
        // Moving into after connect so we can obtain the ip address
        Particle.Client.create(this, afterCreate);
      }
    }.bind(this));
  }
}


Particle.Client = {
  create: function(particle, afterCreate) {
    if (!(particle instanceof Particle)) {
      throw new Error(errors.instance);
    }
    var state = priv.get(particle);
    var connection = {
      host: state.host,
      port: state.port
    };

    state.socket = net.connect(connection, function() {
      // Set ready state bit
      particle.isReady = true;
      particle.emit("ready");

      startReading.call(particle, state);
    });

    afterCreate();
  }
};

Particle.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Particle
  },
  MODES: {
    value: modes
  },
  HIGH: {
    value: 1
  },
  LOW: {
    value: 0
  },
  deviceId: {
    get: function() {
      return priv.get(this).deviceId || "UNKNOWN";
    }
  },
  deviceName: {
    get: function() {
      return priv.get(this).deviceName || "UNKNOWN";
    }
  },
  deviceIp: {
    get: function() {
      return priv.get(this).host || "UNKNOWN";
    }
  },
  devicePort: {
    get: function() {
      return priv.get(this).port || "UNKNOWN";
    }
  }
});

function fetchJson(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      var body = "", err;

      res.on("data", function(d) {
        body += d;
      });

      res.on("end", function () {
        if (res.statusCode === 200) {
            var data = JSON.parse(body);

            if (data.error) {
              reject("ERROR: " + data.code + " " + data.error_description);
            } else {
              resolve(data);
            }
        } else {
          reject(errors.cloud + ": code: " + res.statusCode + " " + res.statusMessage);
        }
      });
    });
  });
}

function fetchDeviceId(token, deviceName) {
  var url = service(token);

  return fetchJson(url)
    .then(function(devices) {
      var device = devices.find(function(d) {
        return d.name === deviceName;
      });

      if (device) {
        return device.id;
      } else {
        return Promise.reject("Unable to find device " + deviceName);
      }
    });
}

Particle.prototype.fetchEndpoint = function() {
  var state = priv.get(this);
  var promise = state.deviceId ?
    Promise.resolve(state.deviceId) :
    fetchDeviceId(state.token, state.deviceName).then(function(deviceId) {
      return state.deviceId = deviceId;
    });

  return promise.then(function(deviceId) {
    var url = service(state.token, state.deviceId, "endpoint");
    return fetchJson(url);
  });
};

Particle.prototype.connect = function(handler) {
  var state = priv.get(this);
  var err;

  if (state.isConnected) {
    return this;
  }

  this.fetchEndpoint()
    .then(function(data) {
      if(handler) {
        handler(null, data);
      }
    })
    .catch(function(error) {
      if(handler) {
        handler(error, null);
      }
    });
};

Particle.prototype.pinMode = function(pin, mode) {
  var state = priv.get(this);
  var buffer;
  var offset;
  var pinInt;
  var sMode;

  sMode = mode = +mode;

  // Normalize when the mode is ANALOG (2)
  if (mode === 2) {
    // Normalize to pin string name if numeric pin
    if (typeof pin === "number") {
      pin = "A" + pin;
    }
  }

  // For PWM (3), writes will be executed via analogWrite
  if (mode === 3) {
    sMode = 1;
  }

  offset = pin[0] === "A" ? 10 : 0;
  pinInt = (String(pin).replace(/A|D/, "") | 0) + offset;

  // Throw if attempting to create a PWM or SERVO on an incapable pin
  // True PWM (3) is CONFIRMED available on:
  //
  //     D0, D1, A0, A1, A5
  //
  //
  if (this.pins[pinInt].supportedModes.indexOf(mode) === -1) {
    throw new Error("Unsupported pin mode: " + modesMap[mode] + " for " + pin);
  }

  // Track the mode that user expects to see.
  this.pins[pinInt].mode = mode;

  // Send the coerced mode
  buffer = new Buffer([ 0x00, pinInt, sMode ]);

  // console.log(buffer);
  state.socket.write(buffer);

  return this;
};

["analogWrite", "digitalWrite"].forEach(function(fn) {
  var isAnalog = fn === "analogWrite";
  var action = isAnalog ? 0x02 : 0x01;

  Particle.prototype[fn] = function(pin, value) {
    var state = priv.get(this);
    var buffer = new Buffer(3);
    var offset = pin[0] === "A" ? 10 : 0;
    var pinInt = (String(pin).replace(/A|D/i, "") | 0) + offset;

    buffer[0] = action;
    buffer[1] = pinInt;
    buffer[2] = value;

    // console.log(buffer);
    state.socket.write(buffer);
    this.pins[pinInt].value = value;

    return this;
  };
});

Particle.prototype.servoWrite = function(pin, value) {
  var state = priv.get(this);
  var buffer;
  var offset = pin[0] === "A" ? 10 : 0;
  var pinInt = (String(pin).replace(/A|D/i, "") | 0) + offset;

  if (value < 544) {
    buffer = new Buffer(3);
    value = constrain(value, 0, 180);
    buffer[0] = 0x41;
    buffer[1] = pinInt;
    buffer[2] = value;
  } else {
    buffer = new Buffer(4);
    value = constrain(value, this.pins[pinInt].pwm.servoMin, this.pins[pinInt].pwm.servoMax);
    buffer[0] = 0x43;
    buffer[1] = pinInt;
    buffer[2] = value & 0x7f;
    buffer[3] = value >> 7;
  }

  // console.log(buffer);
  state.socket.write(buffer);
  this.pins[pinInt].value = value;

  return this;
};

Particle.prototype.servoConfig = function(pin, min, max) {
  var offset = pin[0] === "A" ? 10 : 0;
  var pinInt = (String(pin).replace(/A|D/i, "") | 0) + offset;
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
  
  if (this.pins[pinInt].mode !== modes.SERVO) {
    this.pinMode(pinInt, modes.SERVO);
  }

  pins[pinInt].pwm.servoMin = min;
  pins[pinInt].pwm.servoMax = max;

};

// TODO: Define protocol for gather this information.
["analogRead", "digitalRead"].forEach(function(fn) {
  var isAnalog = fn === "analogRead";
  // Use 0x05 to get a continuous read.
  var action = 0x05;
  // var action = isAnalog ? 0x04 : 0x03;
  // var offset = isAnalog ? 10 : 0;
  var value = isAnalog ? 2 : 1;
  var type = isAnalog ? "analog" : "digital";

  Particle.prototype[fn] = function(pin, handler) {
    var state = priv.get(this);
    var buffer = new Buffer(3);
    var pinInt;
    var event;

    if (isAnalog && typeof pin === "number") {
      pin = "A" + pin;
    }
    var offset = pin[0] === "A" ? 10 : 0;
    pinInt = (String(pin).replace(/A|D/i, "") | 0) + offset;
    event = type + "-read-" + pin;

    buffer[0] = action;
    buffer[1] = pinInt;
    buffer[2] = value;

    // register a handler for
    this.on(event, handler);

    startReading.call(this, state);

    // Tell the board we have a new pin to read
    state.socket.write(buffer);

    return this;
  };
});

Particle.prototype.pingRead = function(opts, handler) {
  var state = priv.get(this);
  var buffer = new Buffer(2);
  var pin = opts.pin;
  var offset = pin[0] === "A" ? 10 : 0;
  var pinInt;
  var event;

  pinInt = (String(pin).replace(/A|D/i, "") | 0) + offset;
  event = "ping-read-" + pinInt;

  buffer[0] = PING_READ;
  buffer[1] = pinInt;

  this.once(event, handler);

  startReading.call(this, state);

  state.socket.write(buffer);

  return this;
};

/**
 * I2C Support
 */
Particle.prototype.i2cConfig = function(options) {
  var state = priv.get(this);
  var delay;

  if (options === undefined) {
    options = 0;
  }

  // If this encounters an legacy calls to i2cConfig
  if (typeof options === "number") {
    delay = options;
  } else {
    delay = options.delay;
  }

  state.socket.write(new Buffer([I2C_CONFIG].concat(to7BitBytes(delay))));
};

Particle.prototype.i2cWrite = function(address, cmdRegOrData, dataBytes) {
  /**
   * cmdRegOrData:
   * [... arbitrary bytes]
   *
   * or
   *
   * cmdRegOrData, dataBytes:
   * command [, ...]
   *
   */
  var state = priv.get(this);
  var register = cmdRegOrData;
  var dataToSend, payloadLength;

  // If i2cWrite was used for an i2cWriteReg call...
  if (arguments.length === 3 &&
      typeof cmdRegOrData === "number" &&
      typeof dataBytes === "number") {

    dataBytes = [dataBytes];
  }

  // Fix arguments if called with Firmata.js API
  if (arguments.length === 2) {
    if (Array.isArray(cmdRegOrData)) {
      dataBytes = cmdRegOrData.slice();
      register = dataBytes.shift();
    } else {
      dataBytes = [];
    }
  }

  payloadLength = dataBytes.length * 2 + 2;

  dataToSend = [I2C_WRITE, address]
    .concat(to7BitBytes(payloadLength))
    .concat(to7BitBytes(register));

  dataBytes.forEach(function(byte) {
    dataToSend = dataToSend.concat(to7BitBytes(byte));
  });

  state.socket.write(new Buffer(dataToSend));

  return this;
};

Particle.prototype.i2cWriteReg = function(address, register, value) {
  return this.i2cWrite(address, [register, value]);
};

Particle.prototype.i2cRead = function(address, register, bytesToRead, callback) {
  var state = priv.get(this);
  var event = "I2C-reply-" + address;
  var dataToSend;

  // Fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === "number" &&
      typeof bytesToRead === "function") {
    callback = bytesToRead;
    bytesToRead = register;
    register = null;
  }

  callback = typeof callback === "function" ? callback : function() {};

  if (typeof register === "number") {
    event += "-" + register;
  } else {
    register = I2C_REGISTER_NOT_SPECIFIED;
  }

  this.on(event, callback);

  startReading.call(this, state);

  dataToSend = [I2C_READ_CONTINUOUS, address]
    .concat(to7BitBytes(register))
    .concat(to7BitBytes(bytesToRead));

  state.socket.write(new Buffer(dataToSend));

  return this;
};

Particle.prototype.i2cReadOnce = function(address, register, bytesToRead, callback) {
  var state = priv.get(this);
  var event = "I2C-reply-" + address;
  var dataToSend;

  // Fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === "number" &&
      typeof bytesToRead === "function") {
    callback = bytesToRead;
    bytesToRead = register;
    register = null;
  }

  callback = typeof callback === "function" ? callback : function() {};

  if (typeof register === "number") {
    event += "-" + register;
  } else {
    register = I2C_REGISTER_NOT_SPECIFIED;
  }

  this.once(event, callback);

  startReading.call(this, state);

  dataToSend = [I2C_READ, address]
    .concat(to7BitBytes(register))
    .concat(to7BitBytes(bytesToRead));

  state.socket.write(new Buffer(dataToSend));

  return this;
};

// Necessary for Firmata.js compatibility.
Particle.prototype.sendI2CWriteRequest = Particle.prototype.i2cWrite;
Particle.prototype.sendI2CReadRequest = Particle.prototype.i2cReadOnce;
Particle.prototype.sendI2CConfig = Particle.prototype.i2cConfig;

/**
 * Compatibility Shimming
 */
Particle.prototype.setSamplingInterval = function(interval) {
  var state = priv.get(this);
  var safeInterval = Math.max(Math.min(Math.pow(2, 14) - 1, interval), 10);

  priv.get(this).interval = safeInterval;

  state.socket.write(new Buffer([SAMPLE_INTERVAL].concat(to7BitBytes(safeInterval))));

  return this;
};


Particle.prototype.internalRGB = function(red, green, blue) {
  var state = priv.get(this);
  var data = [INTERNAL_RGB];
  var input, values;


  if (arguments.length === 0) {
    return Object.assign({}, state.rgb);
  }

  if (arguments.length === 1) {
    input = red;

    if (input === null || input === undefined) {
      throw new Error("Particle.internalRGB: invalid color (" + input + ")");
    }

    if (typeof input === "object") {

      if (Array.isArray(input)) {
        // internalRGB([Byte, Byte, Byte])
        values = input.slice();
      } else {
        // internalRGB({
        //   red: Byte,
        //   green: Byte,
        //   blue: Byte
        // });
        values = [ input.red, input.green, input.blue ];
      }
    } else {

      if (typeof input === "string") {
        // internalRGB("#ffffff")
        if (input.length === 7 && input[0] === "#") {
          input = input.slice(1);
        }

        if (!input.match(/^[0-9A-Fa-f]{6}$/)) {
          throw new Error("Particle.internalRGB: invalid color (" + input + ")");
        }

        // internalRGB("ffffff")
        values = [
          parseInt(input.slice(0, 2), 16),
          parseInt(input.slice(2, 4), 16),
          parseInt(input.slice(4, 6), 16),
        ];
      }
    }
  } else {
    // internalRGB(Byte, Byte, Byte)
    values = [red, green, blue];
  }

  // Be sure we got all three values from one of the above signatures
  if (values.length !== 3 || values.includes(null) || values.includes(undefined)) {
    throw new Error("Particle.internalRGB: invalid color ([" + values.join(",") + "])");
  }

  values = values.map(function(value) {
    return constrain(value, 0, 255);
  });

  // Update internal state
  state.rgb.red = values[0];
  state.rgb.green = values[1];
  state.rgb.blue = values[2];


  // Send buffer over wire
  state.socket.write(new Buffer(data.concat(values)));
  return this;
};

Particle.prototype.reset = function() {
  return this;
};

Particle.prototype.close = function() {
  var state = priv.get(this);
  state.socket.close();
  state.server.close();
};

function scale(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) /
    (inMax - inMin) + outMin;
}

function constrain(value, lower, upper) {
  return Math.min(upper, Math.max(lower, value));
}


module.exports = Particle;

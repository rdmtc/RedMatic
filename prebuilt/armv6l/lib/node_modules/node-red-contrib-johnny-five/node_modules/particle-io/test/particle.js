"use strict";

var Particle = require("../lib/particle");
var Emitter = require("events").EventEmitter;
var sinon = require("sinon");
var ParticleAPIVariable = {cmd: "VarReturn", result: "127.0.0.1:48879"};


function setupParticle(test) {
  test.clock = sinon.useFakeTimers();

  test.state = new State();
  test.map = sinon.stub(Map.prototype, "get").returns(test.state);
  test.socketwrite = sinon.spy(test.state.socket, "write");
  test.connect = sinon.stub(Particle.prototype, "connect", function(handler) {
    handler(null, {cmd: "VarReturn", result: "127.0.0.1:48879"});
  });

  return new Particle({
    token: "token",
    deviceId: "deviceId"
  });
}

function restore(target) {
  for (var prop in target) {
    if (target[prop] != null &&
        typeof target[prop].restore === "function") {
      target[prop].restore();
    }
    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}


function State() {
  this.isConnected = false;
  this.isReading = false;
  this.deviceId = "deviceId";
  this.token = "token";
  this.service = "service";
  this.port = 9000;
  this.server = {};
  this.socket = new Emitter();
  this.socket.write = function() {};
  this.rgb = {
    red: null,
    green: null,
    blue: null
  };
}

sinon.stub(Particle.Client, "create", function(particle, onCreated) {
  process.nextTick(function() {
    particle.emit("ready");
  });
  process.nextTick(onCreated);
});

exports["Particle"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);

    this.proto = {};

    this.proto.functions = [{
      name: "analogRead"
    }, {
      name: "analogWrite"
    }, {
      name: "connect"
    }, {
      name: "digitalRead"
    }, {
      name: "digitalWrite"
    }, {
      name: "pinMode"
    }, {
      name: "servoWrite"
    }];

    this.proto.objects = [{
      name: "MODES"
    }];

    this.proto.numbers = [{
      name: "HIGH"
    }, {
      name: "LOW"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "analogPins"
    }, {
      name: "deviceId"
    }, {
      name: "deviceName"
    }, {
      name: "deviceIp"
    }, {
      name: "devicePort"
    }];

    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  shape: function(test) {
    test.expect(
      this.proto.functions.length +
      this.proto.objects.length +
      this.proto.numbers.length +
      this.instance.length
    );

    this.proto.functions.forEach(function(method) {
      test.equal(typeof this.particle[method.name], "function");
    }, this);

    this.proto.objects.forEach(function(method) {
      test.equal(typeof this.particle[method.name], "object");
    }, this);

    this.proto.numbers.forEach(function(method) {
      test.equal(typeof this.particle[method.name], "number");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.particle[property.name], "undefined");
    }, this);

    test.done();
  },
  readonly: function(test) {
    test.expect(7);

    test.equal(this.particle.HIGH, 1);

    test.throws(function() {
      this.particle.HIGH = 42;
    });

    test.equal(this.particle.LOW, 0);

    test.throws(function() {
      this.particle.LOW = 42;
    });

    test.deepEqual(this.particle.MODES, {
      INPUT: 0,
      OUTPUT: 1,
      ANALOG: 2,
      PWM: 3,
      SERVO: 4,
      I2C: 6
    });

    test.throws(function() {
      this.particle.MODES.INPUT = 42;
    });

    test.throws(function() {
      this.particle.MODES = 42;
    });

    test.done();
  },
  emitter: function(test) {
    test.expect(1);
    test.ok(this.particle instanceof Emitter);
    test.done();
  },
  connected: function(test) {
    test.expect(1);

    this.particle.on("connect", function() {
      test.ok(true);
      test.done();
    });
  },
  ready: function(test) {
    test.expect(1);

    this.particle.on("ready", function() {
      test.ok(true);
      test.done();
    });
  }
};

[
  "analogWrite",
  "digitalWrite",
  "analogRead",
  "digitalRead"
].forEach(function(fn) {
  var entry = "Particle.prototype." + fn;
  var action = fn.toLowerCase();
  var isAnalog = action === "analogwrite" || action === "analogread";

  var index = isAnalog ? 10 : 0;
  var pin = isAnalog ? "A0" : "D0";
  // All reporting messages are received as:
  //
  // [action, pin, lsb, msb]
  //
  // Where lsb and msb are 7-bit bytes that represent a single value
  //
  //
  var receiving = new Buffer(isAnalog ? [4, 10, 127, 31] : [3, 0, 1, 0]);
  var sent, value, type;

  exports[entry] = {
    setUp: function(done) {
      this.particle = setupParticle(this);
      done();
    },
    tearDown: function(done) {
      restore(this);
      done();
    }
  };

  // *Read Tests
  if (/read/.test(action)) {
    type = isAnalog ? "analog" : "digital";
    value = isAnalog ? 1023 : 1;
    // This triggers the "reporting" action to start
    sent = isAnalog ?
      [5, 10, 2] : // continuous, analog 0, analog
      [5, 0, 1];   // continuous, digital 0, digital

    exports[entry].data = function(test) {
      test.expect(4);

      var handler = function(data) {
        test.equal(data, value);
        test.done();
      };

      this.particle[fn](pin, handler);

      var buffer = this.socketwrite.args[0][0];

      for (var i = 0; i < sent.length; i++) {
        test.equal(sent[i], buffer.readUInt8(i));
      }

      this.state.socket.emit("data", receiving);
    };

    exports[entry].handler = function(test) {
      test.expect(1);

      var handler = function(data) {
        test.equal(data, value);
        test.done();
      };

      this.particle[fn](pin, handler);
      this.state.socket.emit("data", receiving);
    };

    exports[entry].event = function(test) {
      test.expect(1);

      var event = type + "-read-" + pin;

      this.particle.once(event, function(data) {
        test.equal(data, value);
        test.done();
      });

      var handler = function(data) {};

      this.particle[fn](pin, handler);
      this.state.socket.emit("data", receiving);
    };

    if (isAnalog) {
      exports[entry].analogPin = function(test) {

        test.expect(1);

        var handler = function(data) {
          test.equal(data, value);
          test.done();
        };

        // Analog read on pin 0 (zero), which is A0 or 10
        this.particle.analogRead(0, handler);
        this.state.socket.emit("data", receiving);
      };
    }

  } else {
    // *Write Tests
    value = isAnalog ? 255 : 1;
    sent = isAnalog ? [2, 10, 255] : [1, 0, 1];
    exports[entry].write = function(test) {
      test.expect(4);

      this.particle[fn](pin, value);

      test.ok(this.socketwrite.calledOnce);

      var buffer = this.socketwrite.args[0][0];

      for (var i = 0; i < sent.length; i++) {
        test.equal(sent[i], buffer.readUInt8(i));
      }

      test.done();
    };

    exports[entry].stored = function(test) {
      test.expect(1);

      this.particle[fn](pin, value);

      test.equal(this.particle.pins[index].value, value);

      test.done();
    };
  }
});


exports["Particle.protototype.digitalRead (port value)"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },

  portValue: function(test) {
    test.expect(3);

    var spy = sinon.spy();
    var high = new Buffer(
      // CMD, PORT, LSB, MSB
      [0x05, 0x00, 0x20, 0x00]
    );

    var low = new Buffer(
      // CMD, PORT, LSB, MSB
      [0x05, 0x00, 0x10, 0x00]
    );

    this.particle.pinMode("D5", this.particle.MODES.INPUT);
    this.particle.digitalRead("D5", spy);
    this.state.socket.emit("data", high);
    this.state.socket.emit("data", low);

    test.equal(spy.callCount, 2);
    test.ok(spy.firstCall.calledWith(1));
    test.ok(spy.lastCall.calledWith(0));

    test.done();
  }
};

function validateSent(test, buffer, sent) {
  test.equal(sent.length, buffer.length);

  for (var i = 0; i < sent.length; i++) {
    test.equal(sent[i], buffer.readUInt8(i));
  }
}

exports["Particle.protototype.i2cConfig"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  noOptionsDefaultsToZero: function(test) {
    var particle = this.particle;
    test.expect(4);

    particle.i2cConfig();

    validateSent(test, this.socketwrite.args[0][0], [
      0x30,       // command
      0x00, 0x00  // 7bit delay
    ]);

    test.done();
  },
  numericOptionSendsConfigWithDelay: function(test) {
    test.expect(4);

    this.particle.i2cConfig(55);

    validateSent(test, this.socketwrite.args[0][0], [
      0x30,       // command
      0x37, 0x00  // 7bit delay
    ]);

    test.done();
  },
  objectOptionSendsConfigWithDelay: function(test) {
    test.expect(4);

    this.particle.i2cConfig({
      delay: 550
    });

    validateSent(test, this.socketwrite.args[0][0], [
      0x30,       // command
      0x26, 0x04  // 7bit delay
    ]);

    test.done();
  }
};

exports["Particle.protototype.i2cWrite"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  singleValueGetsSent: function(test) {
    var address = 0x01;
    var register = 0x02;
    var value = 0xEE;

    test.expect(9);

    this.particle.i2cWrite(address, register, value);

    validateSent(test, this.socketwrite.args[0][0], [
      0x31,       // command
      0x01,       // address
      0x04, 0x00, // data length
      0x02, 0x00, // register
      0x6E, 0x01  // 7bit value
    ]);

    test.done();
  },
  multipleDataBytesGetSent: function(test) {
    var address = 0x11;
    var register = 0x22;
    var data = [0x01, 0xCC, 0xFF];

    test.expect(13);

    this.particle.i2cWrite(address, register, data);

    validateSent(test, this.socketwrite.args[0][0], [
      0x31,       // command
      0x11,       // address
      0x08, 0x00, // data length
      0x22, 0x00, // register
      0x01, 0x00, // 7bit data[0]
      0x4C, 0x01, // 7bit data[1]
      0x7F, 0x01, // 7bit data[2]
    ]);

    test.done();
  },
  dataCallWithEmbeddedRegister: function(test) {
    var address = 0x33;
    var register = 0x44;
    var data = [register, 0xAA];

    test.expect(9);

    this.particle.i2cWrite(address, data);

    validateSent(test, this.socketwrite.args[0][0], [
      0x31,       // command
      0x33,       // address
      0x04, 0x00, // data length
      0x44, 0x00, // register
      0x2A, 0x01, // 7bit data[0]
    ]);

    test.done();
  },
  registerWithoutData: function(test) {
    var address = 0x55;
    var register = 0x66;

    test.expect(7);

    this.particle.i2cWrite(address, register);

    validateSent(test, this.socketwrite.args[0][0], [
      0x31,       // command
      0x55,       // address
      0x02, 0x00, // data length
      0x66, 0x00  // register
    ]);

    test.done();
  }
};

exports["Particle.protototype.i2cWriteReg"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    this.particle.i2cWrite = sinon.spy();
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  callsWriteWithRegData: function(test) {
    var address = 0x11;
    var register = 0x22;
    var value = 99;

    test.expect(1);

    this.particle.i2cWriteReg(address, register, value);

    test.ok(this.particle.i2cWrite.calledWith(address, [register, value]));

    test.done();
  }
};

exports["Particle.protototype.i2cRead"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  readWithRegister: function(test) {
    var address = 0x11;
    var register = 0x22;
    var bytesToRead = 4;
    var callback = sinon.spy();

    test.expect(7);

    this.particle.i2cRead(address, register, bytesToRead, callback);

    validateSent(test, this.socketwrite.args[0][0], [
      0x33,       // command
      0x11,       // address
      0x22, 0x00, // register
      0x04, 0x00
    ]);

    test.done();
  },

  readWithoutRegister: function(test) {
    var address = 0x11;
    var bytesToRead = 4;
    var callback = sinon.spy();

    test.expect(7);

    this.particle.i2cRead(address, bytesToRead, callback);

    validateSent(test, this.socketwrite.args[0][0], [
      0x33,       // command
      0x11,       // address
      0x7F, 0x01, // no register, send 0xFF
      0x04, 0x00
    ]);

    test.done();
  },
  receiveDataWithRegister: function(test) {
    var address = 0x11;
    var register = 0x22;
    var bytesToRead = 4;

    test.expect(1);

    var handler = function(data) {
      test.deepEqual(data, [0x11, 0x22, 0x33, 0x44]);
      test.done();
    };

    this.particle.i2cRead(address, register, bytesToRead, handler);

    this.state.socket.emit("data", new Buffer([
      0x77,       // I2C_REPLY
      0x04,       // data length
      0x11,       // address
      0x22, 0x00, // register
      0x11, 0x22, 0x33, 0x44 // data
    ]));
  },
  receiveDataWithoutRegister: function(test) {
    var address = 0x11;
    var bytesToRead = 4;

    test.expect(1);

    var handler = function(data) {
      test.deepEqual(data, [0x11, 0x22, 0x33, 0x44]);
      test.done();
    };

    this.particle.i2cRead(address, bytesToRead, handler);

    this.state.socket.emit("data", new Buffer([
      0x77,       // I2C_REPLY
      0x04,       // data length
      0x11,       // address
      0xFF, 0x00, // no register, receive dummy 0xFF
      0x11, 0x22, 0x33, 0x44 // data
    ]));
  }
};

exports["Particle.protototype.i2cReadOnce"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  readOnceWithRegister: function(test) {
    var address = 0x11;
    var register = 0x22;
    var bytesToRead = 4;
    var callback = sinon.spy();

    test.expect(7);

    this.particle.i2cReadOnce(address, register, bytesToRead, callback);

    validateSent(test, this.socketwrite.args[0][0], [
      0x32,       // command
      0x11,       // address
      0x22, 0x00, // register
      0x04, 0x00
    ]);

    test.done();
  },
  readOnceWithoutRegister: function(test) {
    var address = 0x11;
    var bytesToRead = 4;
    var callback = sinon.spy();

    test.expect(7);

    this.particle.i2cReadOnce(address, bytesToRead, callback);

    validateSent(test, this.socketwrite.args[0][0], [
      0x32,       // command
      0x11,       // address
      0x7F, 0x01, // no register, send 0xFF
      0x04, 0x00
    ]);

    test.done();
  },
  receiveDataWithRegister: function(test) {
    var address = 0x11;
    var register = 0x22;
    var bytesToRead = 4;

    test.expect(1);

    var handler = function(data) {
      test.deepEqual(data, [0x11, 0x22, 0x33, 0x44]);
      test.done();
    };

    this.particle.i2cReadOnce(address, register, bytesToRead, handler);

    this.state.socket.emit("data", new Buffer([
      0x77,       // I2C_REPLY
      0x04,       // data length
      0x11,       // address
      0x22, 0x00, // register
      0x11, 0x22, 0x33, 0x44 // data
    ]));
  },
  receiveDataWithoutRegister: function(test) {
    var address = 0x11;
    var bytesToRead = 4;

    test.expect(1);

    var handler = function(data) {
      test.deepEqual(data, [0x11, 0x22, 0x33, 0x44]);
      test.done();
    };

    this.particle.i2cReadOnce(address, bytesToRead, handler);

    this.state.socket.emit("data", new Buffer([
      0x77,       // I2C_REPLY
      0x04,       // data length
      0x11,       // address
      0xFF, 0x00, // no register, receive dummy 0xFF
      0x11, 0x22, 0x33, 0x44 // data
    ]));
  }
};

exports["Particle.prototype.servoWrite"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  analogWriteToDigital: function(test) {
    test.expect(3);

    var sent = [2, 0, 180];

    this.particle.analogWrite("D0", 180);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  analogWriteToAnalog: function(test) {
    test.expect(3);

    var sent = [2, 10, 255];

    this.particle.analogWrite("A0", 255);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  servoWriteDigital: function(test) {
    test.expect(3);

    var sent = [0x41, 0, 180];

    this.particle.servoWrite("D0", 180);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  servoWriteAnalog: function(test) {
    test.expect(3);

    var sent = [0x41, 10, 180];

    this.particle.servoWrite("A0", 180);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  servoWriteOutsideRange: function(test) {
    test.expect(3);

    var sent = [0x41, 10, 180];

    this.particle.servoWrite("A0", 220);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  servoWriteMicroseconds: function(test) {
    test.expect(4);

    var sent = [0x43, 10, 14, 12];

    this.particle.servoWrite("A0", 1550);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  servoWriteMicrosecondsOutsideRange: function(test) {
    test.expect(4);

    var sent = [0x43, 10, 96, 18];

    this.particle.servoWrite("A0", 3000);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  servoConfig: function(test) {
    test.expect(4);

    test.equal(this.particle.pins[10].pwm.servoMin, 600);
    test.equal(this.particle.pins[10].pwm.servoMax, 2400);
    
    this.particle.servoConfig("A0", 1000, 2000);
    
    test.equal(this.particle.pins[10].pwm.servoMin, 1000);
    test.equal(this.particle.pins[10].pwm.servoMax, 2000);
    
    test.done();
  }
};



exports["Particle.prototype.pinMode"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  analogOutput: function(test) {
    test.expect(4);

    var sent = [0, 11, 1];

    this.particle.pinMode("A1", 1);
    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },
  analogInput: function(test) {
    test.expect(4);

    var sent = [0, 11, 0];

    this.particle.pinMode("A1", 0);
    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },

  analogInputMapped: function(test) {
    test.expect(4);

    var sent = [0, 11, 2];

    this.particle.pinMode(1, 2);
    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },

  digitalOutput: function(test) {
    test.expect(4);

    var sent = [0, 0, 1];

    this.particle.pinMode("D0", 1);

    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },

  digitalInput: function(test) {
    test.expect(4);

    var sent = [0, 0, 0];

    this.particle.pinMode("D0", 0);

    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },

  servo: function(test) {
    test.expect(4);

    var sent = [0, 0, 4];

    this.particle.pinMode("D0", 4);

    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },

  pwmCoercedToOutput: function(test) {
    test.expect(4);

    var sent = [0, 0, 1];

    this.particle.pinMode("D0", 3);

    test.ok(this.socketwrite.calledOnce);

    var buffer = this.socketwrite.args[0][0];

    for (var i = 0; i < sent.length; i++) {
      test.equal(sent[i], buffer.readUInt8(i));
    }
    test.done();
  },

  pwmError: function(test) {
    test.expect(7);

    try {
      this.particle.pinMode("D0", 3);
      this.particle.pinMode("D1", 3);
      this.particle.pinMode("D2", 3);
      this.particle.pinMode("D3", 3);
      this.particle.pinMode("A0", 3);
      this.particle.pinMode("A1", 3);
      this.particle.pinMode("A4", 3);
      this.particle.pinMode("A5", 3);
      this.particle.pinMode("A6", 3);
      this.particle.pinMode("A7", 3);

      test.ok(true);
    } catch(e) {
      test.ok(false);
    }

    try {
      this.particle.pinMode("D4", 3);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("D5", 3);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("D6", 3);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("D7", 3);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("A2", 3);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("A3", 3);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    test.done();
  },

  servoError: function(test) {
    test.expect(7);

    try {
      this.particle.pinMode("D0", 4);
      this.particle.pinMode("D1", 4);
      this.particle.pinMode("D2", 4);
      this.particle.pinMode("D3", 4);
      this.particle.pinMode("A0", 4);
      this.particle.pinMode("A1", 4);
      this.particle.pinMode("A4", 4);
      this.particle.pinMode("A5", 4);
      this.particle.pinMode("A6", 4);
      this.particle.pinMode("A7", 4);

      test.ok(true);
    } catch(e) {
      test.ok(false);
    }

    try {
      this.particle.pinMode("D4", 4);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("D5", 4);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("D6", 4);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("D7", 4);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("A2", 4);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    try {
      this.particle.pinMode("A3", 4);
      test.ok(false);
    } catch(e) {
      test.ok(true);
    }

    test.done();
  }
};

exports["Particle.prototype.internalRGB"] = {
  setUp: function(done) {
    this.particle = setupParticle(this);
    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },

  get: function(test) {
    test.expect(3);

    test.deepEqual(this.particle.internalRGB(), {
      red: null, green: null, blue: null
    });
    test.ok(this.socketwrite.notCalled);

    this.particle.internalRGB(10, 20, 30);
    test.deepEqual(this.particle.internalRGB(), {
      red: 10, green: 20, blue: 30
    });

    test.done();
  },

  setReturnsThis: function(test) {
    test.expect(1);

    test.equal(this.particle.internalRGB(0, 0, 0), this.particle);
    test.done();
  },

  setWithThreeArgs: function(test) {
    test.expect(6);

    this.particle.internalRGB(0, 0, 0);

    test.ok(this.socketwrite.called);

    var buffer = this.socketwrite.getCall(0).args[0];

    test.equal(buffer.readUInt8(0), 0x07);
    test.equal(buffer.readUInt8(1), 0);
    test.equal(buffer.readUInt8(2), 0);
    test.equal(buffer.readUInt8(3), 0);

    test.deepEqual(this.particle.internalRGB(), {
      red: 0, green: 0, blue: 0
    });

    test.done();
  },

  setWithArrayOfThreeBytes: function(test) {
    test.expect(6);

    this.particle.internalRGB([0, 0, 0]);

    test.ok(this.socketwrite.called);

    var buffer = this.socketwrite.getCall(0).args[0];

    test.equal(buffer.readUInt8(0), 0x07);
    test.equal(buffer.readUInt8(1), 0);
    test.equal(buffer.readUInt8(2), 0);
    test.equal(buffer.readUInt8(3), 0);

    test.deepEqual(this.particle.internalRGB(), {
      red: 0, green: 0, blue: 0
    });

    test.done();
  },

  setWithObjectContainingPropertiesRGB: function(test) {
    test.expect(6);

    this.particle.internalRGB({
      red: 0, green: 0, blue: 0
    });

    test.ok(this.socketwrite.called);

    var buffer = this.socketwrite.getCall(0).args[0];

    test.equal(buffer.readUInt8(0), 0x07);
    test.equal(buffer.readUInt8(1), 0);
    test.equal(buffer.readUInt8(2), 0);
    test.equal(buffer.readUInt8(3), 0);

    test.deepEqual(this.particle.internalRGB(), {
      red: 0, green: 0, blue: 0
    });

    test.done();
  },

  setWithHexString: function(test) {
    test.expect(6);

    this.particle.internalRGB("#000000");

    test.ok(this.socketwrite.called);

    var buffer = this.socketwrite.getCall(0).args[0];

    test.equal(buffer.readUInt8(0), 0x07);
    test.equal(buffer.readUInt8(1), 0);
    test.equal(buffer.readUInt8(2), 0);
    test.equal(buffer.readUInt8(3), 0);

    test.deepEqual(this.particle.internalRGB(), {
      red: 0, green: 0, blue: 0
    });

    test.done();
  },

  setWithHexStringNoPrefix: function(test) {
    test.expect(6);

    this.particle.internalRGB("000000");

    test.ok(this.socketwrite.called);

    var buffer = this.socketwrite.getCall(0).args[0];

    test.equal(buffer.readUInt8(0), 0x07);
    test.equal(buffer.readUInt8(1), 0);
    test.equal(buffer.readUInt8(2), 0);
    test.equal(buffer.readUInt8(3), 0);

    test.deepEqual(this.particle.internalRGB(), {
      red: 0, green: 0, blue: 0
    });

    test.done();
  },

  setConstrainsValues: function(test) {
    test.expect(6);

    this.particle.internalRGB(300, -1, 256);

    test.ok(this.socketwrite.called);

    var buffer = this.socketwrite.getCall(0).args[0];

    test.equal(buffer.readUInt8(0), 0x07);
    test.equal(buffer.readUInt8(1), 255);
    test.equal(buffer.readUInt8(2), 0);
    test.equal(buffer.readUInt8(3), 255);

    test.deepEqual(this.particle.internalRGB(), {
      red: 255, green: 0, blue: 255
    });

    test.done();
  },

  setBadValues: function(test) {
    var particle = this.particle;

    test.expect(14);

    // null
    test.throws(function() {
      particle.internalRGB(null);
    });

    // shorthand not supported
    test.throws(function() {
      particle.internalRGB("#fff");
    });

    // bad hex
    test.throws(function() {
      particle.internalRGB("#ggffff");
    });
    test.throws(function() {
      particle.internalRGB("#ggffffff");
    });
    test.throws(function() {
      particle.internalRGB("#ffffffff");
    });

    // by params
    test.throws(function() {
      particle.internalRGB(10, 20, null);
    });
    test.throws(function() {
      particle.internalRGB(10, 20);
    });
    test.throws(function() {
      particle.internalRGB(10, undefined, 30);
    });


    // by array
    test.throws(function() {
      particle.internalRGB([10, 20, null]);
    });
    test.throws(function() {
      particle.internalRGB([10, undefined, 30]);
    });
    test.throws(function() {
      particle.internalRGB([10, 20]);
    });

    // by object
    test.throws(function() {
      particle.internalRGB({red: 255, green: 100});
    });
    test.throws(function() {
      particle.internalRGB({red: 255, green: 100, blue: null});
    });
    test.throws(function() {
      particle.internalRGB({red: 255, green: 100, blue: undefined});
    });


    test.done();
  }
};

"use strict";

global.IS_TEST_MODE = true;

var rewire = require("rewire");
var Imp = rewire("../lib/imp.js");
var Emitter = require("events").EventEmitter;
var sinon = require("sinon");

var fakes = {
  error: null,
  response: { statusCode: 200 },
  payload: []
};
var requestStub = function(address, handler) {
  handler(fakes.error, fakes.response, fakes.payload.join(",") + ",");
};

Imp.__set__("request", requestStub);

var Pin = Imp.__Pin;
var read = Imp.__read;
var write = Imp.__write;

// Imp.__message = message;
// Imp.__enqueue = enqueue;

function restore(target) {
  for (var prop in target) {
    if (typeof target[prop].restore === "function") {
      target[prop].restore();
    }
  }
}

exports["Imp"] = {
  setUp: function(done) {

    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    this.proto = {};

    this.proto.functions = [{
      name: "analogRead"
    }, {
      name: "analogWrite"
    }, {
      name: "digitalRead"
    }, {
      name: "digitalWrite"
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
    }];

    this.originalFakes = Object.assign({}, fakes);

    done();
  },
  tearDown: function(done) {
    Object.assign(fakes, this.originalFakes);
    restore(this);
    Imp.reset();
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
      test.equal(typeof this.imp[method.name], "function");
    }, this);

    this.proto.objects.forEach(function(method) {
      test.equal(typeof this.imp[method.name], "object");
    }, this);

    this.proto.numbers.forEach(function(method) {
      test.equal(typeof this.imp[method.name], "number");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imp[property.name], "undefined");
    }, this);

    test.done();
  },
  readonly: function(test) {
    test.expect(7);

    test.equal(this.imp.HIGH, 1);

    test.throws(function() {
      this.imp.HIGH = 42;
    });

    test.equal(this.imp.LOW, 0);

    test.throws(function() {
      this.imp.LOW = 42;
    });

    test.deepEqual(this.imp.MODES, {
      INPUT: 0,
      OUTPUT: 1,
      ANALOG: 2,
      PWM: 3,
      SERVO: 4
    });

    test.throws(function() {
      this.imp.MODES.INPUT = 42;
    });

    test.throws(function() {
      this.imp.MODES = 42;
    });

    test.done();
  },
  emitter: function(test) {
    test.expect(1);
    test.ok(this.imp instanceof Emitter);
    test.done();
  },
  connected: function(test) {
    test.expect(1);

    this.imp.on("connect", function() {
      test.ok(true);
      test.done();
    });
  },
  ready: function(test) {
    test.expect(1);

    this.imp.on("ready", function() {
      test.ok(true);
      test.done();
    });
  }
};


exports["Imp.prototype.analogRead"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    this.originalFakes = Object.assign({}, fakes);

    done();
  },
  tearDown: function(done) {
    Object.assign(fakes, this.originalFakes);
    restore(this);
    Imp.reset();

    this.imp.removeAllListeners("analog-read-1");

    done();
  },
  correctMode: function(test) {
    test.expect(1);

    // Reading from an ANALOG pin should set its mode to 1 ("out")
    this.imp.analogRead(1, function() {});

    test.equal(this.imp.pins[1].mode, 2);
    this.clock.tick(10);
    test.done();
  },

  analogPinNumber: function(test) {
    test.expect(1);
    this.imp.on("ready", function() {
      this.analogRead(1, function(data) {
        test.done();
      });
      test.equal(this.pins[1].mode, 2);
      this.emit("analog-read-1", 1023);
    });
  },

  analogPinString: function(test) {
    test.expect(1);
    this.imp.on("ready", function() {
      this.analogRead("pin1", function(data) {
        test.done();
      });
      test.equal(this.pins[1].mode, 2);
      this.emit("analog-read-1", 1023);
    });
  }
};

exports["Imp.prototype.digitalRead"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    this.originalFakes = Object.assign({}, fakes);

    done();
  },
  tearDown: function(done) {
    Object.assign(fakes, this.originalFakes);
    restore(this);
    Imp.reset();

    this.imp.removeAllListeners("digital-read-1");

    done();
  },
  correctMode: function(test) {
    test.expect(1);

    this.imp.digitalRead(1, function() {});

    test.equal(this.imp.pins[1].mode, 0);
    this.clock.tick(10);
    test.done();
  },

  digitalPinNumber: function(test) {
    test.expect(1);
    this.imp.on("ready", function() {
      this.digitalRead(1, function(data) {
        test.done();
      });
      test.equal(this.pins[1].mode, 0);
      this.emit("digital-read-1", 1);
    });
  },

  digitalPinString: function(test) {
    test.expect(1);
    this.imp.on("ready", function() {
      this.digitalRead("pin1", function(data) {
        test.done();
      });
      test.equal(this.pins[1].mode, 0);
      this.emit("digital-read-1", 1);
    });
  }
};



exports["Imp.prototype.analogWrite"] = {
  setUp: function(done) {
    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    Imp.reset();
    done();
  },

  mode: function(test) {
    test.expect(2);

    this.imp.pinMode(9, this.imp.MODES.PWM);
    test.equal(this.imp.pins[9].mode, 3);
    test.equal(this.imp.pins[9].isPwm, true);

    test.done();
  },

  write: function(test) {
    test.expect(1);

    this.imp.analogWrite(9, 255);

    var payload = Imp.__message.payload.slice().split("|").map(function(data) {
      return data.split(",").map(Number);
    });

    test.deepEqual(payload, [
      // PIN_MODE, PIN, MODE
      [ 244, 9, 3 ],
      // ANALOG_WRITE, PIN, LSB, MSB
      [ 224, 9, 127, 1 ]
    ]);

    test.done();
  },

  stored: function(test) {
    test.expect(1);

    this.imp.analogWrite(9, 255);

    test.equal(this.imp.pins[9].value, 255);

    test.done();
  }
};

exports["Imp.prototype.servoWrite"] = {
  setUp: function(done) {
    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    Imp.reset();
    done();
  },

  mode: function(test) {
    test.expect(2);

    this.imp.pinMode(9, this.imp.MODES.PWM);
    test.equal(this.imp.pins[9].mode, 3);
    test.equal(this.imp.pins[9].isPwm, true);

    test.done();
  },

  write: function(test) {
    test.expect(1);

    this.imp.servoWrite(9, 180);

    var payload = Imp.__message.payload.slice().split("|").map(function(data) {
      return data.split(",").map(Number);
    });

    test.deepEqual(payload, [
      // PIN_MODE, PIN, MODE
      [ 244, 9, 4 ],
      // SERVO_WRITE, PIN, LSB, MSB
      [ 225, 9, 52, 1 ]
    ]);

    test.done();
  },

  stored: function(test) {
    test.expect(1);

    this.imp.servoWrite(9, 180);

    test.equal(this.imp.pins[9].value, 180);

    test.done();
  }
};

exports["Imp.prototype.pinMode (analog)"] = {
  setUp: function(done) {

    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    Imp.reset();

    done();
  },
  analogOut: function(test) {
    test.expect(1);

    this.imp.pinMode(1, 1);
    test.equal(this.imp.pins[1].mode, 1);

    test.done();
  },
  analogIn: function(test) {
    test.expect(1);

    this.imp.pinMode(1, 2);
    test.equal(this.imp.pins[1].mode, 2);

    test.done();
  }
};

exports["Imp.prototype.pinMode (digital)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.imp = new Imp({
      agent: "[[AGENT_ID]]"
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    Imp.reset();

    done();
  },
  digitalOut: function(test) {
    test.expect(1);

    this.imp.pinMode(5, 1);
    test.equal(this.imp.pins[5].mode, 1);

    test.done();
  },
  digitalIn: function(test) {
    test.expect(1);

    this.imp.pinMode(5, 0);
    test.equal(this.imp.pins[5].mode, 0);

    test.done();
  }
};

exports["Imp.prototype.pinMode (pwm/servo)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.imp = new Imp();

    done();
  },
  tearDown: function(done) {
    restore(this);
    Imp.reset();

    done();
  },
  pwm: function(test) {
    test.expect(2);

    this.imp.pinMode(2, 3);
    test.equal(this.imp.pins[2].mode, 3);
    test.equal(this.imp.pins[2].isPwm, true);

    test.done();
  },
  servo: function(test) {
    test.expect(2);

    this.imp.pinMode(2, 4);
    test.equal(this.imp.pins[2].mode, 4);
    test.equal(this.imp.pins[2].isPwm, true);

    test.done();
  },
  modeInvalid: function(test) {
    test.expect(4);

    // Invalid pin #
    test.throws(function() {
      this.imp.pinMode(12, this.imp.MODES.PWM);
    }.bind(this));

    test.throws(function() {
      this.imp.analogWrite(12, 255);
    }.bind(this));

    test.throws(function() {
      this.imp.pinMode(12, this.imp.MODES.SERVO);
    }.bind(this));

    test.throws(function() {
      this.imp.servoWrite(12, 255);
    }.bind(this));

    test.done();
  },
};

exports["Imp.prototype.setSamplingInterval"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.imp = new Imp();

    done();
  },
  tearDown: function(done) {
    restore(this);
    Imp.reset();

    done();
  },
  samplingIntervalDefault: function(test) {
    test.expect(1);
    read();
    test.equal(read.samplingInterval, 1);
    test.done();
  },
  samplingIntervalCustom: function(test) {
    test.expect(1);
    read();
    this.imp.setSamplingInterval(1000);
    test.equal(read.samplingInterval, 1000);
    test.done();
  }
};

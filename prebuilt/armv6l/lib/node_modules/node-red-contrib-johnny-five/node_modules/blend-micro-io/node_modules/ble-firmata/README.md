BLE Firmata
===========
Arduino [Firmata](http://firmata.org) implementation on BLE (Bluetooth Low Energy) and Node.js.

[![Build Status](https://travis-ci.org/shokai/node-ble-firmata.svg?branch=master)](https://travis-ci.org/shokai/node-ble-firmata)

- Firmata is a protocol to controll Arduino from software on PC.
  - You can embed Arduino code into Node.js application.
- supports [BlendMicro](http://redbearlab.squarespace.com/blendmicro/).
  - also should works on [BLE Shield](http://redbearlab.squarespace.com/bleshield/), but I dont't have it.


sites

- https://github.com/shokai/node-ble-firmata
- https://npmjs.org/package/ble-firmata


Install
-------

    % npm install ble-firmata


Requirements
------------

- [BlendMicro](http://redbearlab.squarespace.com/blendmicro)
  - you have to check pin function. pin 4/6/7 are reserved for BLE controll.
- Install [patched Standard Firmata v2.3](./firmware/BLEFirmataSketch/BLEFirmataSketch.ino) to BlendMicro
  - fix `#define BLE_NAME "BlendMicro"` if you need.
  - [download zip](https://github.com/shokai/node-ble-firmata/archive/master.zip)


Usage
-----

### Samples

- https://github.com/shokai/ble-arduino-firmata/tree/master/samples


### Setup

Connect
```javascript
var BLEFirmata = require('ble-firmata');
var arduino = new BLEFirmata();

// search device with BLE peripheral name
arduino.connect("BlendMicro");

// search with default name "BlendMicro"
arduino.connect();

arduino.on('connect', function(){

  console.log("board version"+arduino.boardVersion);
  // your-code-here

});
```

Reset
```javascript
arduino.reset(callback);
```

Close
```javascript
arduino.close(callback);
```


### I/O

Digital Write
```javascript
arduino.digitalWrite(13, true, callback);
arduino.digitalWrite(13, false, callback);
```

Digital Read
```javascript
arduino.pinMode(1, BLEFirmata.INPUT);
console.log( arduino.digitalRead(1) ); // => true/false
```

Digital Read (event)
```javascript
arduino.pinMode(1, BLEFirmata.INPUT);

arduino.on('digitalChange', function(e){
  console.log("pin" + e.pin + " : " + e.old_value + " -> " + e.value);
});
```

Analog Write (PWM)
```
setInterval(function(){
  var an = Math.random()*255; // 0 ~ 255
  arduino.analogWrite(9, an, callback);
}, 100);
```

Analog Read
```javascript
console.log( arduino.analogRead(0) ); // => 0 ~ 1023
```

Analog Read (event)
```javascript
arduino.on('analogChange', function(e){
  console.log("pin" + e.pin + " : " + e.old_value + " -> " + e.value);
});
```

Servo Motor
```javascript
setInterval(function(){
  var angle = Math.random()*180; // 0 ~ 180
  arduino.servoWrite(11, angle, callback);
}, 1000);
```

### Sysex

- http://firmata.org/wiki/V2.1ProtocolDetails#Sysex_Message_Format
- https://github.com/shokai/ble-arduino-firmata/tree/master/samples/sysex

Send
```javascript
arduino.sysex(0x01, [13, 5, 2], callback);  // command, data_array, callback
```

Register Sysex Event
```javascript
arduino.on('sysex', function(e){
  console.log("command : " + e.command);
  console.log(e.data);
});
```


Test
----

### Install SysexLedBlinkFirmata into Arduino

* https://github.com/shokai/node-ble-firmata/blob/master/samples/sysex/BLEFirmataWithLedBlink/BLEFirmataWithLedBlink.ino


### Run Test

    % npm install
    % npm test


Contributing
------------
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

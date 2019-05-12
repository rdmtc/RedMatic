
node-led
========================

## What is this?

This repo is a library compatible with Rick Waldron's [johnny-five](https://github.com/rwaldron/johnny-five) project. It adds support for [Adafruit's LED backpacks](https://learn.adafruit.com/adafruit-led-backpack).


## Install


`npm install node-led`


### 8x8 matrix example

```javascript
var five = require('johnny-five'),
    board = new five.Board(),
    Matrix8x8 = require('node-led').Matrix8x8;

board.on('ready', function() {
  console.log('Connected to Arduino, ready.');

  var opts = {
    address: 0x70
  };

  var matrix = new Matrix8x8(board, opts);

  var smile = [
    0b00111100,
    0b01000010,
    0b10100101,
    0b10000001,
    0b10100101,
    0b10011001,
    0b01000010,
    0b00111100
  ];

  matrix.drawBitmap(smile);

});

```

![EightByEightMatrix](docs/eightByEightMatrix.jpg)

### 7 segment numeric example

```javascript
var five = require('johnny-five'),
    board = new five.Board(),
    SevenSegment = require('node-led').SevenSegment;

board.on('ready', function() {
  console.log('Connected to Arduino, ready.');

  var opts = {
    address: 0x70
  };

  var display = new SevenSegment(board, opts);

  display.clearDisplay();
  display.writeText("3.A:C.E")
});

```
![SevenSegment](docs/sevenSegment.jpg)

### 14 segment alphanumeric example

```javascript
var five = require('johnny-five'),
    board = new five.Board(),
    AlphaNum4 = require('node-led').AlphaNum4;

board.on('ready', function() {
  console.log('Connected to Arduino, ready.');

  var opts = {
    address: 0x70
  };

  var display = new AlphaNum4(board, opts);
  display.clearDisplay();
  display.writeText("Node");

});

```
![AlphaNum4](docs/alphanum4.jpg)

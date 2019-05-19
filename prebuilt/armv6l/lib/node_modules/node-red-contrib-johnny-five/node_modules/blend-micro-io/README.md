# blend-micro-io

![logo](http://cl.ly/image/37301B1K0H2G/blend-micro-io.png)

## What is this?
Takes [shokai](https://github.com/shokai)'s [node-ble-firmata](https://github.com/shokai/node-ble-firmata), adds a couple of missing features, and packages it up to use as an IO for [Johnny-Five](https://github.com/rwaldron/johnny-five), a node hardware library

Specifically written to work with a [BlendMicro](http://redbearlab.com/blendmicro) from RedBearLab.

## How do I install it?

1. Install [NodeJS](http://nodejs.org) on your computer
2. Install the latest [Arduino IDE](http://arduino.cc/en/Main/Software), and follow [these further instructions for adding BlendMicro support](http://redbearlab.com/getting-started-blendmicro)
3. In the Arduino IDE, upload [patched StandardFirmata v2.3](https://github.com/shokai/node-ble-firmata/tree/master/firmware/BLEFirmataSketch) to your BlendMicro while connected via USB
4. Pop open your terminal software of choice
5. ``mkdir fun-with-blendmicro && cd fun-with-blendmicro``
6. ``npm install johnny-five``
7. ``npm install blend-micro-io``


## How do I use it?

This IO is designed to be dropped into Johnny-Five to enable bluetooth LE connectivity with the BlendMicro.

Create a new javascript file within your newly made directory from following the previous steps. Enter the following, and use Johnny-Five as normal. To close the connection, try ``board.io.close()``

```javascript
var five = require('johnny-five');
var blendMicroIO = require('blend-micro-io');

var board = new five.Board({
  io: new blendMicroIO()
});

board.on('ready', function() {
  // do johnny five stuff
});
```


## Help!

### I am new to things!

+ New to NodeJS? [Check out these resources by @rockbot](https://github.com/rockbot/node-for-beginners).
+ New to Johnny-Five? Alrighty - [check the repo](https://github.com/rwaldron/johnny-five) for docs on how to start.

### I am on OSX Yosemite ಠ_ಠ

My sympathies. Bluetooth is still a little dodgy for some people using this version of OSX. Hopefully things will be better with new updates from Apple as they come. So if you're having issues with this library, first try sanity checking on a non Yosemite computer if possible.

---

Thank you to [Alex Potsides](https://github.com/achingbrain/node-ioboard) for the johnny-five IO template.
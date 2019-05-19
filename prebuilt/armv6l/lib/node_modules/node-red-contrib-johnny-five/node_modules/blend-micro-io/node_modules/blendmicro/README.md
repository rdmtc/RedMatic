BlendMicro npm
==============
Node.js module for [BlendMicro](http://redbearlab.com/blendmicro/) and [BLENano](http://redbearlab.com/blenano) with BLE.

    Node.js <---(BLE)---> BlendMicro/BLENano

- using [noble npm](http://npmjs.org/package/noble) as BLE wrapper
- [serialport npm](https://www.npmjs.org/package/serialport) like API

sites

- https://www.npmjs.org/package/blendmicro
- https://github.com/shokai/blendmicro-node

[![Circle CI](https://circleci.com/gh/shokai/blendmicro-node.svg?style=svg)](https://circleci.com/gh/shokai/blendmicro-node)

Install
-------

    % npm i blendmicro


BLE Terminal
------------

    % npm i blendmicro coffee-script -g
    % blendmicro -help
    % blendmicro -list
    % blendmicro -term [DEVICE_NAME]


Samples
-------

see [samples](https://github.com/shokai/blendmicro-node/tree/master/samples) directory.


Usage
-----

### Open

blendmicro side

```c
#include <SPI.h>
#include <boards.h>
#include <RBL_nRF8001.h>

void setup(){
  ble_set_name("BlendMicro");
  ble_begin();
}
```
if you are using BLE Nano, see `samples/` directory.

node.js side

```javascript
var BlendMicro = require('blendmicro');

// search device with BLE peripheral name
var bm = new BlendMicro("BlendMicro");

// search with deefault name "BlendMicro"
var bm = new BlendMicro();

bm.on('open', function(){
  console.log("open!!");
});
```


### Read

```javascript
bm.on("data", function(data){
  console.log(data.toString());
});
```

### Write

```javascript
bm.write("hello");

bm.write( new Buffer([1,2,3]) );
```

### Close

```javascript
bm.close(function(){
  console.log("closed");
});
```

### Auto re-connection

```javascript
bm.reconnect = false // default is "true" (enabled)
```

Contributing
------------
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

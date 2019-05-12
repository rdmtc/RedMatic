mqtt-packet&nbsp;&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mqttjs/mqtt-packet.png)](https://travis-ci.org/mqttjs/mqtt-packet)
===========

Encode and Decode MQTT 3.1.1 packets the node way.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

  * <a href="#installation">Installation</a>
  * <a href="#examples">Examples</a>
  * <a href="#packets">Packets</a>
  * <a href="#api">API</a>
  * <a href="#contributing">Contributing</a>
  * <a href="#license">License &amp; copyright</a>

This library is tested with node v4, v6 and v7. The last version to support
older versions of node was mqtt-packet@4.1.2.

Installation
------------

```bash
npm install mqtt-packet --save
```

Examples
--------

### Generating

```js
var mqtt = require('mqtt-packet')
var object = {
  cmd: 'publish',
  retain: false,
  qos: 0,
  dup: false,
  length: 10,
  topic: 'test',
  payload: 'test' // Can also be a Buffer
}

console.log(mqtt.generate(object))
// Prints:
//
// <Buffer 30 0a 00 04 74 65 73 74 74 65 73 74>
//
// Which is the same as:
//
// new Buffer([
//   48, 10, // Header (publish)
//   0, 4, // Topic length
//   116, 101, 115, 116, // Topic (test)
//   116, 101, 115, 116 // Payload (test)
// ])
```

### Parsing

```js
var mqtt = require('mqtt-packet')
var parser = mqtt.parser()

// Synchronously emits all the parsed packets
parser.on('packet', function(packet) {
  console.log(packet)
  // Prints:
  //
  // {
  //   cmd: 'publish',
  //   retain: false,
  //   qos: 0,
  //   dup: false,
  //   length: 10,
  //   topic: 'test',
  //   payload: <Buffer 74 65 73 74>
  // }
})

parser.parse(new Buffer([
  48, 10, // Header (publish)
  0, 4, // Topic length
  116, 101, 115, 116, // Topic (test)
  116, 101, 115, 116 // Payload (test)
])
// Returns the number of bytes left in the parser
```

API
---

  * <a href="#generate"><code>mqtt#<b>generate()</b></code></a>
  * <a href="#writeToStream"><code>mqtt#<b>writeToStream()</b></code></a>
  * <a href="#parser"><code>mqtt#<b>parser()</b></code></a>

<a name="generate">

### mqtt.generate(object)

Generates a `Buffer` containing an MQTT packet.
The object must be one of the ones specified by the [packets](#packets)
section. Throws an `Error` if a packet cannot be generated.

<a name="writeToStream">

### mqtt.writeToStream(object, stream)

Writes the mqtt packet defined by `object` to the given stream.
The object must be one of the ones specified by the [packets](#packets)
section. Emits an `Error` on the stream if a packet cannot be generated.
On node >= 0.12, this function automatically calls `cork()` on your stream,
and then it calls `uncork()` on the next tick.
By default cache for number buffers is enabled.
It creates a list of buffers for faster write. To disable cache set `mqtt.writeToStream.cacheNumbers = false`.
Should be set before any `writeToStream` calls.

<a name="parser">

### mqtt.parser()

Returns a new `Parser` object. `Parser` inherits from `EventEmitter` and
will emit:

  * `packet`, when a new packet is parsed, according to
    [packets](#packets)
  * `error`, if an error happens

<a name="parse">

#### Parser.parse(buffer)

Parses a given `Buffer` and emits synchronously all the MQTT packets that
are included. Returns the number of bytes left to parse.

If an error happens, an `error` event will be emitted, but no `packet` events
will be emitted after that. Calling `parse()` again clears the error and
previous buffer, as if you created a new `Parser`.

Packets
-------

This section describes the format of all packets emitted by the `Parser`
and that you can input to `generate`.

### Connect

```js
{
  cmd: 'connect',
  protocolId: 'MQTT', // Or 'MQIsdp' in MQTT 3.1
  protocolVersion: 4, // Or 3 in MQTT 3.1
  clean: true, // Can also be false
  clientId: 'my-device',
  keepalive: 0, // Seconds which can be any positive number, with 0 as the default setting
  username: 'matteo',
  password: new Buffer('collina'), // Passwords are buffers
  will: {
    topic: 'mydevice/status',
    payload: new Buffer('dead') // Payloads are buffers
  }
}
```

If `protocolVersion` is 3, `clientId` is mandatory and `generate` will throw if
missing.

If `password` or `will.payload` are passed as strings, they will
automatically be converted into a `Buffer`.

### Connack

```js
{
  cmd: 'connack',
  returnCode: 0, // Or whatever else you see fit
  sessionPresent: false // Can also be true.
}
```

The only mandatory argument is `returnCode`, as `generate` will throw if
missing.

### Subscribe

```js
{
  cmd: 'subscribe',
  messageId: 42,
  subscriptions: [{
    topic: 'test',
    qos: 0
  }]
}
```

All properties are mandatory.

### Suback

```js
{
  cmd: 'suback',
  messageId: 42,
  granted: [0, 1, 2, 128]
}
```

All the granted qos __must__ be < 256, as they are encoded as UInt8.
All properties are mandatory.

### Unsubscribe

```js
{
  cmd: 'unsubscribe',
  messageId: 42,
  unsubscriptions: [
    'test',
    'a/topic'
  ]
}
```

All properties are mandatory.

### Unsuback

```js
{
  cmd: 'unsuback',
  messageId: 42
}
```

All properties are mandatory.

### Publish

```js
{
  cmd: 'publish',
  messageId: 42,
  qos: 2,
  dup: false,
  topic: 'test',
  payload: new Buffer('test'),
  retain: false
}
```

Only the `topic` property is mandatory.
Both `topic` and `payload` can be `Buffer` objects instead of strings.
`messageId` is mandatory for `qos > 0`.

### Puback

```js
{
  cmd: 'puback',
  messageId: 42
}
```

The only mandatory property is `messageId`, as `generate` will throw if
missing.

### Pubrec

```js
{
  cmd: 'pubcomp',
  messageId: 42
}
```

The only mandatory property is `messageId`, as `generate` will throw if
missing.

### Pubrel

```js
{
  cmd: 'pubrel',
  messageId: 42
}
```

The only mandatory property is `messageId`, as `generate` will throw if
missing.

### Pubcomp

```js
{
  cmd: 'pubcomp',
  messageId: 42
}
```

The only mandatory property is `messageId`, as `generate` will throw if
missing.

### Pingreq

```js
{
  cmd: 'pingreq'
}
```

### Pingresp

```js
{
  cmd: 'pingresp'
}
```

### Disconnect

```js
{
  cmd: 'disconnect'
}
```

<a name="contributing"></a>

Contributing
------------

mqtt-packet is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/mqttjs/mqtt-packet/blob/master/CONTRIBUTING.md) file for more details.

### Contributors

mqtt-packet is only possible due to the excellent work of the following contributors:

<table><tbody>
<tr><th align="left">Matteo Collina</th><td><a href="https://github.com/mcollina">GitHub/mcollina</a></td><td><a href="http://twitter.com/matteocollina">Twitter/@matteocollina</a></td></tr>
<tr><th align="left">Adam Rudd</th><td><a href="https://github.com/adamvr">GitHub/adamvr</a></td><td><a href="http://twitter.com/adam_vr">Twitter/@adam_vr</a></td></tr>
<tr><th align="left">Peter Sorowka</th><td><a href="https://github.com/psorowka">GitHub/psorowka</a></td><td><a href="http://twitter.com/psorowka">Twitter/@psorowka</a></td></tr>
</tbody></table>

License
-------

MIT

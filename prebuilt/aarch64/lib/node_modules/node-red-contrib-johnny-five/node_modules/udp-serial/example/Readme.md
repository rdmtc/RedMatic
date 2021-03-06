udp-serial example app
=============

Virtual serial port clients and server running over UDP

## Getting started

In this directory:

```
npm install
```

## udpRelay.js

This creates a simple upd server relaying traffice to a physically connected Arduino device that has the StandardFirmata.ino sketch loaded onto it.

run:

```
node udpRelay.js
````



## firmataExample.js

This creates a virtual serial port connection the server.  It also as an example, assumes that there is an arduino devices on the other side of the server.  You may edit this file if you'd like to send something other than firmata data.

run:

```
node firmataExample.js
```

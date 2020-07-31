socket.io-serial example
=============

Virtual serial port clients and server running on Socket.io

## Getting started

In this directory:

```
npm install
```

## server.js

This creates a simple socket.io server

run:

```
node server.js
````


## bindExample.js

This binds a local physical serial port to the socket.io server.  It will broadcast serial data to the server, and if receives data from the server it will send the data to the physical serial port.

Edit the file to specify the serial port you're using. Then run:

```
node bindExample.js
```


## firmataExample.js

This creates a virtual serial port connection the server.  It also as an example, assumes that there is an arduino devices on the other side of the server.  You may edit this file if you'd like to send something other than firmata data.

run:

```
node firmataExample.js
```

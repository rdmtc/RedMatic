5.2.2 / Apr 29 2021
===================

  * remove news and updates section of readme
  * drop support for node.js 8 and 13, add support for node.js 15 & 16
  * update dependencies

5.2.1 / Oct 11 2020
===================

  * add directories section to package.json

5.2.0 / Apr 24 2020
===================

  * add unit tests for PromisifiedBus
  * update dependencies
  * drop support for node.js 6, add support for node.js 14

5.1.0 / Oct 03 2019
===================

  * add bus.promisifiedBus and promisifiedBus.bus

5.0.0 / Sep 17 2019
===================

  * drop support for node.js v4
  * add promise support
  * ensure that the properties of i2cFuncs objects are booleans rather than numbers

4.0.11 / Sep 07 2019
====================

  * update dependencies (async v3.1.0, coveralls v3.0.6, lodash v4.17.15, mocha v6.2.0, sinon v7.4.2)

4.0.10 / Jun 16 2019
====================

  * update dependencies
  * update npm keywords

4.0.9 / Mar 14 2019
===================

  * add unit tests
  * update dependencies (nan v2.13.0, jshint v2.10.2)

4.0.8 / Mar 01 2019
===================

  * add travis build
  * lint with jshint
  * update dependencies (bindings v1.5.0, async v2.6.2)
  * document node 11 support
  * add .npmignore and .npmrc

4.0.7 / Dec 19 2018
===================

  * update dependencies (nan v2.12.1, bindings v1.3.1)

4.0.6 / Nov 18 2018
===================

  * fix macOS installation

4.0.5 / Oct 14 2018
===================

  * suppress warnings complaining about casting between incompatible function types (see https://github.com/nodejs/nan/issues/807)

4.0.4 / Oct 13 2018
===================

  * always compile c++ code

4.0.3 / Oct 13 2018
===================

  * fix deprecation warnings on node.js v10.12 (see https://github.com/nodejs/nan/pull/811)

4.0.2 / Sep 30 2018
===================

  * update dependencies (nan v2.11.1, async v2.6.1, lodash v4.17.11)
  * adapt to V8 7.0: replace v8Value->Int32Value() with Nan::To<int32_t>(v8Value).FromJust()
  * adapt to V8 7.0: replace v8Value->Uint32Value() with Nan::To<uint32_t>(v8Value).FromJust()
  * adapt to V8 7.0: replace v8Value->BooleanValue() with Nan::To<bool>(v8Value).FromJust()

4.0.1 / Jul 28 2018
===================

  * code style

4.0.0 / Jul 25 2018
===================

  * modernize codebase
  * drop initial windows support as i can't extend and maintain it

3.2.0 / Apr 21 2018
===================

  * add deviceId and deviceIdSync methods

3.1.0 / Mar 24 2018
===================

  * allow scan address range to be specified
  * update dependencies (nan v2.10.0)

3.0.0 / Feb 25 2018
===================

  * update dependencies (nan v2.9.2)
  * fix deprecations
  * drop support for node.js v0.10, v0.12, v5 and v7

2.0.0 / Feb 11 2018
===================

  * check parameters passed to api at api surface [#42](https://github.com/fivdi/i2c-bus/issues/42)
  * update dependencies (async v2.6.0, lodash 4.17.5)

1.2.5 / Dec 24 2017
===================

  * don't suppress deprecated-declaration warnings
  * update dependencies

1.2.4 / Nov 04 2017
===================

  * suppress deprecated-declaration warnings
  * document node 9 support

1.2.3 / Oct 15 2017
===================

  * update dependencies (bindings v1.3.0, nan v2.7.0)

1.2.2 / May 01 2017
===================

  * update dependencies
  * document supported node versions
  * fix writeQuick argument check

1.2.1 / Feb 12 2017
===================

  * documentation for forceAccess option improved
  * upgrade to nan v2.5.1

1.2.0 / Jan 06 2017
===================

  * added forceAccess option which allows access to devices even if they are already in use by a driver
  * upgrade to nan v2.5.0, lodash v4.17.4 and async v2.1.4

1.1.2 / Oct 05 2016
===================

  * allow scan and scanSync to continue scanning on all errors
  * upgrade to lodash v4.16.3 and async v2.0.1

1.1.1 / Jul 22 2016
===================

  * examples SI1145-sync.js and two-devices-win.js added
  * nan 2.4.0, lodash 4.13.1, async 2.0.0

1.1.0 / May 23 2016
===================

  * initial windows support

1.0.3 / Apr 27 2016
===================

  * nan v2.3.2, lodash 4.11.1

1.0.2 / Jan 29 2016
===================

  * nan 2.2.0, async 1.5.2, lodash 4.1.0

1.0.1 / Dec 05 2015
===================

  * prevent Nan::ErrnoException related segmentation faults in v0.10.29

1.0.0 / Oct 10 2015
===================

  * prevent leaking of fds for busy devices [#13](https://github.com/fivdi/i2c-bus/issues/13)
  * refactored error objects [#12](https://github.com/fivdi/i2c-bus/issues/12)
  * nan 2.1.0

0.12.0 / Oct 06 2015
====================

  * added scan and scanSync [#11](https://github.com/fivdi/i2c-bus/issues/11)
  * nan 2.0.9

0.11.3 / Sep 02 2015
====================
  * nan1 to nan2 migration for iojs v3
  * documented configuration on edison arduino base board
  * documented configuration on the pi

0.11.2 / May 07 2015
====================
  * io.js v2.0.0+ compatibility [#7](https://github.com/fivdi/i2c-bus/issues/7)

0.11.1 / Mar 28 2015
====================

  * Simplify concurrent asynchronous access to multiple devices [#4](https://github.com/fivdi/i2c-bus/issues/4)
  * nan 1.7.0

0.11.0 / Feb 01 2015
====================

  * added writeBlock and writeBlockSync - UNTESTED and undocumented due to lack of supporting hardware
  * added readBlock and readBlockSync - UNTESTED and undocumented due to lack of supporting hardware

0.10.0 / Jan 24 2015
====================

  * added async example
  * strerror replaced with strerror_r
  * nan 1.5.3
  * added async access to multiple devices concurrently example

0.9.0 / Dec 22 2014
===================

  * callback for writeI2cBlock now gets 3 arguments (err, bytesWritten, buffer)
  * added writeQuick and writeQuickSync
  * added example i2cquickscan to scan a bus for devices like 'i2cdetect -y -q 1'
  * fixed i2cscan example on the pi

0.8.0 / Dec 19 2014
===================

  * added a plain i2c performance test
  * added i2cFuncs and i2cFuncsSync
  * added an example that does the same as command 'i2cdetect -F 1'
  * renamed readBytes to readI2cBlock
  * renamed readBytesSync to readI2cBlockSync
  * renamed writeBytes to writeI2cBlock
  * renamed writeBytesSync to writeI2cBlockSync
  * added an example that scans a bus for devices like 'i2cdetect -y -r 1'

0.7.0 / Dec 16 2014
===================

  * faster compile
  * added plain i2cRead, i2cReadSync, i2cWrite, and i2cWriteSync methods

0.6.0 / Dec 15 2014
===================

  * use __u8, __u16, and __s32 where appropriate
  * added brute force memory leak tests
  * added performance tests
  * added an example using two devices on the same bus
  * renamed all public api methods

0.5.0 / Dec 14 2014
===================

  * added block operations

0.4.0 / Dec 13 2014
===================

  * check for valid arguments in addon methods
  * added sync and async tests

0.3.0 / Dec 13 2014
===================

  * improved example

0.2.0 / Dec 13 2014
===================

  * corrected initial release date
  * use callbacks rather than events for asychronous open method
  * documentation
  * return this in synchronous write methods
  * added close and closeSync methods
  * added example

0.1.0 / Dec 09 2014
===================

  * initial release


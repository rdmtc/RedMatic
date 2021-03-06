## 6.2.2 (2019-10-5)

- Added `arm64` to the `cpu` field in package.json for installing on 64-bit Raspberry Pis

## 6.2.1 (2019-2-20)

- Updated dependencies

## 6.2.0 (2019-01-07)

- Added `pullResistor` property to digital input

## 6.1.0 (2018-12-3)

- Updated build tools to latest versions
- Reworked the code to be based on core-io-types (no functionality change, just TypeScript changes)
- Added the `module` export that conforms to core-io-types `IGPIOModule` interface, which makes it easier to pass this entire module all at once as an argument/variable.
- Fixed a bug where `DigitalOutput.value` contains a garbage value prior to the first `write` call.

## 6.0.0 (2018-4-21)

- Updated to pigpio 1
- BREAKING CHANGE: Dropped support for Node 4.

## 5.0.0 (2017-9-12)

- POTENTIALLY BREAKING CHANGE: renamed the following private properties to begin with an underscore because I just learned TypeScript doesn't do anything to hide private properties. Don't use these properties, changes may not be semver-major next time.
    - `DigitalInput.input` -> `DigitalInput._input`
    - `DigitalInput.currentValue` -> `DigitalInput._currentValue`
    - `DigitalOutput.output` -> `DigitalOutput._output`
    - `DigitalOutput.currentValue` -> `DigitalOutput._currentValue`
- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- SORT OF BREAKING-ISH CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before gave a bunch of obtuse errors, so this doesn't _actually_ change the ability to install raspi-gpio, but does make it fail earlier and harder.

## 4.1.0 (2017-8-18)

- Added an override of the `destroy()` method that disables interrupts for the pin.
    - This fixes a bug where creating a new peripheral on top of an old one _may_ have prevented Node.js from exiting properly.

## 4.0.2 (2017-4-23)

- Fixed some important documentation bugs.

## 4.0.1 (2017-4-22)

- Fixed an issue with access for the `value` property.

## 4.0.0 (2017-4-22)

- Rewrote raspi-gpio to use [pigpio](https://github.com/fivdi/pigpio) instead of Wiring Pi
  - Digital Output was broken because of..._something_...I don't know what, but switching fixes it
  - Moving away from Wiring Pi also gets rid of the compile step, which is nice (although pigpio has one)
  - POTENTIALLY BREAKING CHANGE: While I strived to keep the API the same, it's _possible_ that there may be some slight timing differences, especially for inputs with rapidly changing signals
- BREAKING CHANGE: Removed the `enableListener` option. Interrupts are always enabled now.

## 3.1.1 (2017-1-22)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 3.1.0 (2017-1-9)

- Added an `enableListener` that defaults to `true`. When set to `false`, events are not emitted, but the process is also not held up so that it can exit without an explicit call to `process.exit`.

## 3.0.0 (2017-1-5)

- Added a `change` event that is emitted any time the value on the pin changes
  - POTENTIALLY BREAKING CHANGE: If you `require` this module, even if you don't use it, it will prevent the Node process from exiting implicitly. You will have to call `process.exit` explicitly now.

## 2.3.1 (2016-12-3)

- Converted the project to TypeScript and cleaned up a bunch of odds and ends
  - Note: there is no functionality change or bug fixes with this release

## 2.3.0 (2016-7-7)

- Switched dependency ranges to ^
- Bumped dependencies to bring in support for a new Raspberry Pi Zero revision

## 2.2.2 (2016-3-20)

- Dependency update to fix bug
- New build system

## 2.2.1 (2016-3-7)

- Dependency update to add missing Raspberry Pi 3 Model B revision

## 2.2.0 (2016-3-4)

- Updated dependencies to add Raspberry Pi 3 Model B support

## 2.1.0 (2015-12-8)

- Fixed a typo in the pull up/down constants
- Updated dependencies to add Raspberry Pi Zero support

## 2.0.0 (2015-10-20)

- Upgraded to NAN 2
  - POTENTIAL BREAKING CHANGE
  - The API has not changed, but the build requirements have
  - Make sure you are running Raspbian Jessie because this module no longer builds on stock Raspbian Wheezy
  - See https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons for more information

## 1.5.0 (2015-10-12)

- Dependency updates to fix bug with invalid pin aliases
- Updated build dependencies

## 1.4.1 (2015-9-3)

- Dependency updates to fix a bug with pin aliasing

## 1.4.0 (2015-7-16)

- Reverted the changes in 1.3.0
  - The performance tradeoffs weren't worth the ease of installation, sadly
- Updated dependencies
- Updated the repository links to point to their new location
- Added a contributing guide
- Added code linter
- Update code style to use newer best practices

## 1.3.0 (2015-6-2)

- Switched to using node-ffi for calling Wiring Pi.
    - See https://github.com/nodejs/hardware/issues/11 for more info

## 1.2.1 (2015-3-17)

- Dependency update to fix a bug with destroying peripherals

## 1.2.0 (2015-2-21)

- Switched from traceur to babel for ES6->ES5 compilation

## 1.1.0 (2015-2-19)

- Upgraded NAN to get support for Node.js 0.12
  - io.js support is theoretically there, but won't work until https://github.com/TooTallNate/node-gyp/pull/564 is landed

## 1.0.5 (2015-2-12)

- Updated the README to reflect the change to Raspi.js

## 1.0.4 (2015-1-21)

- Locked down the NAN version for now since code breaks on 1.5

## 1.0.3 (2015-1-7)

- New README
- Code cleanup

## 1.0.2 (2014-12-5)

- Bug fix when reading from a destroyed input

## 1.0.1 (2014-12-2)

- Refactored to match changes in raspi-peripheral

## 1.0.0 (2014-11-12)

- Initial implementation

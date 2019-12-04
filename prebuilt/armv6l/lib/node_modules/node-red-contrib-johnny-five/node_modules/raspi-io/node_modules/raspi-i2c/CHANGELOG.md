## 6.2.4 (2019-10-29)

- Updated dependencies and build systems

## 6.2.3 (2019-10-5)

- Added `arm64` to the `cpu` field in package.json for installing on 64-bit Raspberry Pis

## 6.2.2 (2019-2-20)

- Updated dependencies

## 6.2.1 (2019-1-10)

- Got rid of duplicate callback TypeScript types and tightened up the code a bit as a result. No behavior change outside of TypeScript.

## 6.2.0 (2018-12-10)

- Updated TypeScript to v3. Note: the compiled output changed as I previously didn't set the compiled output target flag correctly.
- Added `module` export to conform with Core IO types
- Updated to i2c-bus v4.
    - Note: there are breaking changes in i2c-bus 4, but they are not surfaced in raspi-i2c.

## 6.1.2 (2018-4-21)

- Updated to i2c-bus v3.
    - Note: there are breaking changes in i2c-bus v3, but they are not surfaced in raspi-i2c.

## 6.1.1 (2018-1-16)

- Fixed a bug where readWord wasn't properly swizzling the registerOrCb argument as a register when all parameters supplied

## 6.1.0 (2017-9-15)

- Removed logic for parsing pin information passed to the constructor
    - Normally this would be a breaking change, but it was already broken and the current behavior does nothing anyways, meaning there isn't _actually_ a change in behavior. Funny that.
    - Eventually, I want to rework this to provide support for multiple busses.

## 6.0.0 (2017-9-12)

- POTENTIALLY BREAKING CHANGE: renamed the following private properties to begin with an underscore because I just learned TypeScript doesn't do anything to hide private properties. Don't use these properties, changes may not be semver-major next time.
    - `I2C.devices` -> `I2C._devices`
    - `I2C.getDevice` -> `I2C._getDevice`
- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- SORT OF BREAKING-ISH CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before gave a bunch of obtuse errors, so this doesn't _actually_ change the ability to install raspi-i2c, but does make it fail earlier and harder.

## 5.0.4 (2017-5-20)

- Fixed a bug in `writeSync` where we weren't properly swizzling arguments.

## 5.0.3 (2017-22-1)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 5.0.2 (2016-12-30)

- Added some important documentation to the README that needs to be on npmjs.com
  - Note: there are no code changes, only documentation

## 5.0.1 (2016-12-21)

- Added missing TypeScript definition package.json entry

## 5.0.0 (2016-12-21)

- Made all write callbacks optional
- Normalized read and write callbacks so that error is always null if no error occured
  - POTENTIALLY BREAKING CHANGE: If you were using `err === undefined` or something similar, this will no longer work
- Normalized write callbacks so they only take an error argument
  - POTENTIALLY BREAKING CHANCE: If you were relying on the undocumented extra parameters to the write callback, these will now be `undefined`
- Converted the project to TypeScript and cleaned up a bunch of odds and end

## 4.0.0 (2016-11-23)

- Removed 32 byte length limitation when reading/writing directly to the bus and not to a register
  - POTENTIALLY BREAKING CHANGE: if you were relying on the exception being thrown in this situation, you'll need to update your code.

## 3.1.1 (2016-10-29)

- Updated Dependency

## 3.1.0 (2016-7-7)

- Switched dependency ranges to ^
- Bumped dependencies to bring in support for a new Raspberry Pi Zero revision

## 3.0.0 (2016-3-20)

- Dependency update to fix bug
- New build system
- Removed execSync and Symbol shims
  - BREAKING CHANGE: Node 0.10 is no longer supported as a result

## 2.3.2 (2016-3-7)

- Dependency update to add missing Raspberry Pi 3 Model B revision

## 2.3.1 (2016-3-4)

- Forgot to bump the raspi-peripheral dependency in 2.3.0

## 2.3.0 (2016-3-4)

- Added support for the Raspberry Pi 3 Model B

## 2.2.0 (2016-1-6)

- Added support for Ubuntu

## 2.1.0 (2015-12-8)

- Updated dependencies to add Raspberry Pi Zero support

## 2.0.0 (2015-10-21)

- Upgraded i2c-bus to new version that uses NAN 2
  - POTENTIAL BREAKING CHANGE
  - The API has not changed, but the build requirements have
  - Make sure you are running Raspbian Jessie because this module no longer builds on stock Raspbian Wheezy
  - See https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons for more information

## 1.1.0 (2015-10-12)

- Dependency updates to fix bug with invalid pin aliases
- Updated build dependencies

## 1.0.6 (2015-9-3)

- Dependency updates to fix a bug with pin aliasing

## 1.0.5 (2015-8-10)

- Added a Symbol shim to fix a crash in Node.js 0.10

## 1.0.4 (2015-7-16)

- Updated dependencies
- Updated the repository links to point to their new location
- Added a contributing guide
- Added code linter
- Update code style to use newer best practices

## 1.0.3 (2015-5-26)

- Added a default baudrate value to the install script
- Added notes about the default clock rate being unstable with certain Arduinos

## 1.0.2 (2015-5-4)

- Added documentation
- Updated dependencies and reworked code to use ```validateAlive``` internally.
  - No user-facing changes or bug fixes.

## 1.0.0 (2015-3-23)

- First publish

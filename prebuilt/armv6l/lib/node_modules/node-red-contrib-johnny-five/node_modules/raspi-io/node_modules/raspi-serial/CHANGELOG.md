## 5.1.1 (2019-1-20)

- Updated dependencies

## 5.1.0 (2018-12-9)

- Updated TypeScript to v3. Note: the compiled output changed as I previously didn't set the compiled output target flag correctly.
- Added `module` export to conform with Core IO types

## 5.0.0 (2018-4-21)

- Updgraded to node-serialport 6
- BREAKING CHANGE: dropped support for Node 4.x

## 4.0.0 (2017-9-12)

- POTENTIALLY BREAKING CHANGE: renamed the following private properties to begin with an underscore because I just learned TypeScript doesn't do anything to hide private properties. Don't use these properties, changes may not be semver-major next time.
    - `Serial.portId` -> `Serial._portId`
    - `Serial.options` -> `Serial._options`
    - `Serial.portInstance` -> `Serial._portInstance`
    - `Serial.isOpen` -> `Serial._isOpen`
- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- BREAKING CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before worked for this specific package, but not the rest of the Raspi.js suite
    - If you need serial support on a non-Raspberry Pi platform, you should use [serialport](https://github.com/EmergingTechnologyAdvisors/node-serialport) instead.

## 3.1.0 (2017-4-23)

- Removed broken install script
- Updated documentation to detail serial woes on the RPi

## 3.0.5 (2017-1-22)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 3.0.4 (2017-1-22)

- Added an explicit call to `this.destroy` in `process.on('beforeExit')`. This explicitly forces the serial port to close on exit.

## 3.0.3 (2016-12-30)

- Fixed a crash when a callback is not supplied to open or close

## 3.0.2 (2016-12-30)

- Added some important documentation to the README that needs to be on npmjs.com
  - Note: there are no code changes, only documentation

## 3.0.1 (2016-12-21)

- Added missing TypeScript definition package.json entry

## 3.0.0 (2016-12-21)

- Converted the project to TypeScript and cleaned up a bunch of odds and ends
- Updated the documentation, it was all kinds of wrong. My apologies.
  - BREAKING CHANGE (depending on your definition of it): the old documentation has a number of innacuracies. Technically the code behaves the same as in v2.0.0, but it behaves differently than the old documentation.

## 2.0.0 (2016-10-27)

- Upgraded serialport to version 4
    - POTENTIALLY BREAKING CHANGE: the callback to raspi-serial's `write` method is directly passed to serialport's `write` method, which changed behavior in version 4. See [serialport's upgrade guide](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/master/UPGRADE_GUIDE.md) for more info

## 1.5.0 (2016-7-7)

- Switched dependency ranges to ^
- Bumped dependencies to bring in support for a new Raspberry Pi Zero revision

## 1.4.0 (2016-3-20)

- Added alive checks

## 1.3.1 (2016-3-20)

- Dependency update to fix bug
- New build system

## 1.3.0 (2016-3-13)

- Added `flush` method

## 1.2.0 (2016-3-13)

- Added `DEFAULT_PORT` constant

## 1.1.0 (2016-3-13)

- Added accessors for `port`, `baudRate`, `dataBits`, `stopBits`, and `parity`

## 1.0.0 (2016-3-8)

- Initial implementation

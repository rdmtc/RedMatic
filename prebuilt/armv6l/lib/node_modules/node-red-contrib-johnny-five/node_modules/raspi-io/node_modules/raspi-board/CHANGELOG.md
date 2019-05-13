## 7.1.2 (2019-2-20)

- Updated dependencies

## 7.1.1 (2019-1-15)

- Fixed a dependency issue where "core-io-types" is not found

## 7.1.0 (2019-1-10)

- Reworked the exported pin info to use the Core IO Types pin info interfaces

## 7.0.0 (2019-1-9)

- BREAKING CHANGE: Removed `module` export as Core IO Types is also dropping a board specific module

## 6.2.0 (2018-12-5)

- Updated TypeScript to v3 (no compiled output change)
- Added `module` export to conform with Core IO types

## 6.1.0 (2018-11-29)

- Added support for the Raspberry Pi 3 Model A+

## 6.0.0 (2018-09-21)

- BREAKING CHANGE: dropped support for Node.js 4.x.x
- Rewrote unit tests to use Jasmine and bring it in line with other Raspi IO modules
- Rewrote test mode to use an environment variable instead of a global variable
- Upgraded dependencies, including bumping TypeScript to v3 and tweaking the TS configuration to target newer versions of JavaScript

## 5.3.1 (2018-06-12)

- Added missing RPi 3 Model B revision number

## 5.3.0 (2018-04-28)

- Added a missing RPi 1 Model B+ and RPi 3 Model B revision numbers
- Changed the "unknown board" warning message to an info message and added a much longer description.

## 5.2.0 (2018-04-21)

- Added support for the Raspberry Pi 3 Model B+

## 5.1.0 (2018-01-18)

- Added support for overclocked Pi Zero W's

## 5.0.2 (2017-11-18)

- Updated the tsconfig.json and tslint.json configuration files to use a newer style, build tools updated
- Cleaned up some TypeScript type definitions to be more compatible with DefinitelyTyped
- Note: there is no functionality change with this update

## 5.0.1 (2017-9-11)

- Non-code change: updated the README and republishing to make sure it's in npm

## 5.0.0 (2017-9-11)

- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- SORT OF BREAKING-ISH CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform previously wasn't very useful because it usually crashed with a cryptic error. Now it complains earlier and harder.

## 4.2.0 (2017-4-21)

- Added the `getGpioNumber` method
- Added the `gpio` property on pin info returned from the `getPins` method
- Fixed some bugs around `VERSION_UNKNOWN` not being exported nor returned from `getBoardRevision`

## 4.1.0 (2017-4-19)

- Added support for the Raspberry Pi Zero W

## 4.0.2 (2017-1-22)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 4.0.1 (2016-12-3)

- Converted the project to TypeScript and cleaned up a bunch of odds and ends
  - Note: there is no functionality change or bug fixes with this release

## 4.0.0 (2016-10-13)

- Added missing revision IDs for certain batches of the Raspbery Pi Zero
- Updated logic so an unknown board assumes Raspberry Pi 3 Model B pinout
  - POTENTIALLY BREAKING CHANGE: previous behavior was to throw an exception

## 3.2.0 (2016-9-19)

- Added missing revision ID for certain batches of the Raspberry Pi Model A+

## 3.1.0 (2016-6-21)

- Added missing revision ID for certain batches of the Raspbery Pi Zero

## 3.0.0 (2016-3-20)

- Fixed a bug where `PWM1` wasn't mapped to 23.
  - POTENTIALLY BREAKING CHANGE: using the identifier `PWM1` now maps to Wiring Pi pin 23, not 24
- New build system

## 2.4.1 (2016-3-7)

- Added a missing revision ID for certain batches of Raspberry Pi 3s

## 2.4.0 (2016-3-4)

- Added Raspberry Pi 3 Model B support

## 2.3.0 (2015-12-8)

- Added Raspberry Pi Zero support
- Refactored unit tests to use nodeunit

## 2.2.2 (2015-9-3)

- Fixed a bug where ```getPinNumber(0)``` was returning ```null``` instead of ```0```

## 2.2.1 (2015-7-14)

- Updated the repository links to match the new location

## 2.2.0 (2015-7-14)

- Realized that this should be a minor bump, not a patch bump
- There is a very subtle behavior change in getPinNumber
  - If a pin is not found, it now returns null instead of undefined
  - The behavior when a pin is not found was previously undocumented before this release

## 2.1.3 (2015-7-14)

- Fixed a bug with detecting overclocked RPi revisions
- Added .eslintrc file
- Updated code to pass linting

## 2.1.2 (2015-3-29)

- Added some error checking to getPinNumber to prevent a crash when passing in undefined or null

## 2.1.1 (2015-3-17)

- Fixed a broken unit test

## 2.1.0 (2015-2-21)

- Switched from traceur to babel for ES6->ES5 compilation

## 2.0.0 (2015-2-17)

- Added support for the Raspberry Pi 2
- Added constants for the different board revisions
- Cleaned up error handling surrounding unsupported or unknown versions
- Reworked getBoardRevision to return one of the above constants. THIS IS A BREAKING CHANGE!

## 1.3.0 (2015-2-12)

- Added getBoardRevision method

## 1.2.2 (2014-12-30)

- Added support for looking up Wiring Pi pin numbers that are passed in as a string

## 1.2.1 (2014-12-29)

- README updates

## 1.2.0 (2014-12-20)

- Added P5 support for R2 models
- Added some missed peripherals
- POTENTIALLY BREAKING: Modified all peripherals to have a number, so "SDA"->"SDA0", etc
  - This change was done to allow for multiple SPI connections
  - It's possible there will be multiple I2C and UART pins on future revisions (the BCM2835 supports them)

## 1.1.2 (2014-12-2)

- Well this is embarrassing, I had a bug in package.json

## 1.1.1 (2014-12-1)

- Bug fix with looking up a pin number by said pin number

## 1.1.0 (2014-12-1)

- Switched to using ECMAScript 6
- Added peripheral usage and removed # => P1-# mappings
  - This is a breaking API change!

## 1.0.2 (2014-11-27)

- Reworked aliases so that they map to Wiring Pi numbers, not header numbers
- Added support for "P1-#" style identifiers so that eventually P5 can be supported too

## 1.0.0-1.0.1 (2014-11-26)

- Implemented initial functionality

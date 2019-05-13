## 3.0.3 (2019-2-20)

- Updated dependencies

## 3.0.2 (2019-1-08)

- Reworked the internals to use newly exposed functionality in the base raspi module. No functionality change

## 3.0.1 (2018-12-4)

- Encorporated core-io-types (under the hood preparatory work for some other refactoring)

## 3.0.0 (2018-12-4)

- BREAKING CHANGE: dropped support for Node.js < 6.0.0
- Updated TypeScript to v3 and changed compiled output to be ES2015 compliant instead of ES5 compliant (see above breaking change)
- Update to use core-io-types
- Updated unit tests to use new Jasmine, Istanbul, and Coveralls, and integrated into Travis and Coveralls

## 2.0.1 (2017-9-11)

- Updated dependency with a breaking change. It mirrors the breaking change this module did in 2.0.0, so there is nothing breaking between 2.0.0 and 2.0.1 for this module

## 2.0.0 (2017-9-11)

- BREAKING CHANGE: Changed `Peripheral.alive` and `Peripheral.pins` read-only properties.
- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- SORT OF BREAKING-ISH CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before didn't do much, since most of the Raspi.js suite wouldn't install on non-Raspberry Pi platforms. This module would install, even though you couldn't do anything with it.

## 1.6.4 (2017-22-1)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 1.6.3 (2016-12-3)

- Added types declaration to package.json

## 1.6.2 (2016-12-3)

- Converted the project to TypeScript and cleaned up a bunch of odds and ends
  - Note: there is no functionality change or bug fixes with this release

## 1.6.1 (2016-10-13)

- Bumped dependencies to bring in support for a new Raspberry Pi Zero revisions

## 1.6.0 (2016-7-7)

- Switched dependency ranges to ^
- Bumped dependencies to bring in support for a new Raspberry Pi Zero revision

## 1.5.2 (2016-3-20)

- Dependency update to fix bug
- New build system

## 1.5.1 (2016-3-7)

- Dependency update to add missing Raspberry Pi 3 Model B revision

## 1.5.0 (2016-3-4)

- Bumped dependencies to bring in support for the Raspberry Pi 3 Model B

## 1.4.0 (2015-12-8)

- Bumped dependencies to bring in support for the Raspberry Pi Zero

## 1.3.0 (2015-10-12)

- Added a check for invalid pins being passed in
  - Invalid pins now cause an exception to be thrown instead of failing silently
- Updated linting infrastructure.
  - An external eslint install is no longer necessary

## 1.2.2 (2015-9-3)

- Fixed tests and updated dependencies

## 1.2.1 (2015-7-14)

- Updated dependencies to match changes in raspi-board
- Added .eslintrc file
- Updated code to pass linting

## 1.2.0 (2015-3-30)

- Added ```validateAlive``` method
- Fixed a potential bug with destroying a peripheral twice

## 1.1.1 (2015-3-17)

- Fixed a bug with global pin state when destroying multi-pin peripherals
- Fixed broken unit tests

## 1.1.0 (2015-2-21)

- Switched from traceur to babel for ES6->ES5 compilation

## 1.0.7 (2015-2-17)

- Updated dependencies to support the Raspberry Pi 2

## 1.0.6 (2015-2-12)

- Doc updates

## 1.0.5 (2014-12-29)

- Doc updates

## 1.0.3-1.04 (2014-12-2)

- Refactor to match changes in raspi-board

## 1.0.2 (2014-11-28)

- Added the ability for a peripheral to use multiple pins

## 1.0.1 (2014-11-26)

- Integrated raspi-board in for pin aliasing and board version management

## 1.0.0 (2014-11-21)

- Implemented initial functionality

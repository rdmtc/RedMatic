## 6.0.1 (2019-2-20)

- Brought in renamed j5-io-types

## 6.0.0 (2019-1-10)

- BREAKING CHANGE: dropped support for Node.js < 6
- Removed the ARM CPU requirement for unit test infrastructure reasons. Don't run this on a not-Raspberry Pi unless you know what you're doing. Doing so is _not_ supported.

## 5.3.0 (2019-1-9)

- Added `getPinNumber` method to the base module to conform to Core IO Types refactor

## 5.2.2 (2019-1-8)

- Ok, fixed those bugs mentioned in 5.2.1 _for realz_ this time.

## 5.2.1 (2019-1-8)

- Fixed a bug where destroying peripherals with more than one pin would cause the `destroy` method to be called more than once.
- Fixed a bug where destroyed peripherals weren't removed from the registry of active pins.

## 5.2.0 (2019-1-8)

- Added `getActivePeripheral`, `setActivePeripheral`, and `getActivePeripherals` methods to the base module. This functionality existed in raspi-peripheral already and was moved here.

## 5.1.0 (2017-12-4)

- Moved dependencies to devDependencies that weren't supposed to be dependencies
- Updated TypeScript to v3 (no compiled output change)
- Added `module` export to conform with Core IO types

## 5.0.2 (2017-11-18)

- Non-ish-code change: Reworked the TypeScript type definition for the signature. It's the same signature, just specified in a way that is easier for DefinitelyTyped to consume.
- Updated the tsconfig.json and tslint.json configuration files to use a newer style, build tools updated
- Note: the compiled output _did not change_

## 5.0.1 (2017-9-11)

- Non-code change: updated the README and republishing to make sure it's in npm

## 5.0.0 (2017-9-11)

- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- SORT OF BREAKING-ISH CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before didn't do much, since most of the Raspi.js suite wouldn't install on non-Raspberry Pi platforms. This module would install, even though you couldn't do anything with it.

## 4.0.0 (2017-4-23)

- Removed Wiring Pi. There _shouldn't_ be any breaking changes, but since this is a large architectural change, I'm doing a major version bump anyways

## 3.0.5 (2017-22-1)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 3.0.4 (2016-12-3)

- Fixed broken publish

## 3.0.3 (2016-12-3)

- Added proper .npmignore

## 3.0.2 (2016-12-3)

- Added types declaration to package.json

## 3.0.1 (2016-12-3)

- Converted the project to TypeScript and cleaned up a bunch of odds and ends
  - Note: there is no functionality change or bug fixes with this release

## 3.0.0 (2016-11-25)

- Removed raspi-wiringpi dependency because Raspbian now ships with it by default.

## 2.1.0 (2016-6-5)

- Removed gulp in favor of npm run scripts
- Updated dependencies

## 2.0.0 (2015-10-20)

- Upgraded to NAN 2
  - POTENTIAL BREAKING CHANGE
  - The API has not changed, but the build requirements have
  - Make sure you are running Raspbian Jessie because this module no longer builds on stock Raspbian Wheezy
  - See https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons for more information

## 1.3.2 (2015-7-16)

- Updated dependencies
- Updated the repository links to point to their new location
- Added code linter
- Update code style to use newer best practices

## 1.3.1 (2015-4-27)

- Updated dependencies

## 1.3.0 (2015-2-21)

- Switched from traceur to babel for ES6->ES5 compilation

## 1.2.0 (2015-2-19)

- Upgraded NAN to get support for Node.js 0.12
  - io.js support is theoretically there, but won't work until https://github.com/TooTallNate/node-gyp/pull/564 is landed

## 1.1.6 (2015-2-11)

- Renamed this package to raspi.js (raspi in NPM) to better reflect the purpose.

## 1.1.5 (2015-1-21)

- Locked down the NAN version for now since code breaks on 1.5

## 1.1.4 (2014-12-29)

- Updated the README

## 1.1.3 (2014-12-20)

- Added a README
- Fixed a script compile issue that prevented 1.1.2 from including the reentrant fix

## 1.1.2 (2014-12-3)

- Made ```init``` properly reentrant

## 1.1.1 (2014-12-2)

- Bug fix in package.json

## 1.1.0 (2014-12-2)

- Switched to ECMAScript 6
- This is a breaking API change! The export structure is slightly different

## 1.0.5 (2014-11-27)

- Fixed a bad NPM publish

## 1.0.4 (2014-11-25)

- Switched to using wiringPiSetup instead of wiringPiSetupGpio

## 1.0.0-1.0.3 (2014-11-14)

- Implemented initial functionality and worked out the kinks in building during ```npm install```

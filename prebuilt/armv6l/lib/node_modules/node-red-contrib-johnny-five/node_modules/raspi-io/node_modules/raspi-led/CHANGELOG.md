## 2.1.2 (2019-10-5)

- Added `arm64` to the `cpu` field in package.json for installing on 64-bit Raspberry Pis

## 2.1.1 (2019-2-20)

- Updated dependencies

## 2.1.0 (2018-12-6)

- Updated TypeScript to v3. Note: the compiled output changed as I previously didn't set the compiled output target flag correctly.
- Added `module` export to conform with Core IO types

## 2.0.0 (2017-9-12)

- BREAKING CHANGE: dropped support for Node.js < 4.0.0, and now enforce it via package.json "engines" field.
- SORT OF BREAKING-ISH CHANGE: dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before gave a bunch of obtuse errors, so this doesn't _actually_ change the ability to install raspi-gpio, but does make it fail earlier and harder.
- Added a new instance method `hasLed()` that returns if a system LED was dedected or not for this instance

## 1.5.5 (2017-22-1)

- Publishing a new version to update the README on npmjs.com. No other changes.

## 1.5.4 (2016-12-21)

- Added missing TypeScript definition package.json entry

## 1.5.3 (2016-12-21)

- Forgot to explicitly mark the methods as public in the TypeScript definition.
  - Note: methods are public by default, so there isn't technically a change, but it's good to be explicit about these things

## 1.5.2 (2016-12-21)

- Converted the project to TypeScript and cleaned up a bunch of odds and ends
  - Note: there is no functionality change or bug fixes with this release

## 1.5.1 (2016-10-29)

- Removed debugging statement accidentally left in

## 1.5.0 (2016-9-19)

- Added guards around file access, so this should work on systems that use a different LED mechanism

## 1.4.0 (2016-7-7)

- Switched dependency ranges to ^
- Bumped dependencies to bring in support for a new Raspberry Pi Zero revision

## 1.3.2 (2016-3-20)

- Dependency update to fix bug
- New build system

## 1.3.1 (2016-3-7)

- Dependency update to add missing Raspberry Pi 3 Model B revision

## 1.3.0 (2016-3-4)

- Updated dependencies to add Raspberry Pi 3 Model B support

## 1.2.0 (2015-12-8)

- Updated dependencies to add Raspberry Pi Zero support

## 1.1.1 (2015-10-13)

- Fixed a bug with raspi-peripheral throwing an exception

## 1.1.0 (2015-10-12)

- Dependency updates to fix bug with invalid pin aliases
- Updated build dependencies

## 1.0.2 (2015-9-3)

- Dependency updates to fix a bug with pin aliasing

## 1.0.1 (2015-7-16)

- Updated dependencies
- Updated the repository links to point to their new location
- Added a contributing guide
- Added code linter
- Update code style to use newer best practices

## 1.0.0 (2015-5-18)

- Initial implementation

## 3.2.0 (2020-2-13)

- Added support for missing i2cWrite method

## 3.1.2 (2019-10-30)

- Fixed incorrect i2cWrite signature

## 3.1.1 (2019-10-29)

- Reworked how I2C commands are issued to fix https://github.com/rwaldron/johnny-five/issues/1639

## 3.1.0 (2019-3-11)

- Added support for missing i2cWrite method
- Fixed a marginally broken TypeScript import (if you tried to use this from TypeScript, it _may_ have given you an error)

## 3.0.1 (2019-2-20)

- Fixed an odd bug by hand (possibly a bug in tsc itself) where the declaration emitted by tsc didn't compile in Raspi IO.

## 3.0.0 (2019-2-20)

- POTENTIALLY BREAKING CHANGE: Rewrote this module from the ground up in TypeScript
- Removed any Raspberry Pi specific code and renamed this module from raspi-io-core to j5-io
- Added unit tests, yay!
- Changed the `digitalRead` update interval to be every 18ms instead of every 19ms to get it spec compliant in practice, not just in theory (must be at least 50Hz/20ms in practice)
- Removed some dead code (no change to behavior)
- Changed error handling in the constructor to throw a more intelligible error if a primitive is passed for options
- Changed `servoConfig` so that it only changes pin mode if it's not already in Servo mode.
- Added better error checking so that all serial* calls
    - Now throws a readable error when `portId` is not included
- Fixed a theoretical bug where i2cRead continues to read after the peripheral is destroyed, which never happens in practice except in unit tests.
- BREAKING CHANGE: Removed `includePins` and `excludePins`, which is replaced with `pinInfo`
- BREAKING CHANGE: Now, only base, gpio, and pwm platform modules are required. The rest are optional
- BREAKING CHANGE: Removed support for software PWM here (it should be handled by Raspi IO, not J5 IO)
- BREAKING CHANGE: `digital-read-${pin}` event names are now normalized. If, for example, you called `digitalRead("GPIO18", () => {})` on the Raspberry Pi, before the event name would be `digital-read-GPIO18`, but now it's `digital-read-1`
- Rewrote the I2C infrastructure to use serial's architecture. This new architecture both gaurantees order of operations while using asynchronous method calls, increasing performance.
- Added a lot of internal infrastructure to support multiple I2C ports, even if it's mostly not supported in the IO Plugin spec (for now?)
- BREAKING CHANGE: Removed the ability to pass a number to `i2cConfig` as its only argument. This was not documented and is not part of the IO Plugin spec.
- BREAKING CHANGE: Added new `i2cIds` property which is required when including I2C support
- BREAKING CHANGE: The expected values in `options.platform` were renamed to be platform independent, and `raspi-board` and `raspo-soft-pwm` were removed entirely

## 2.1.0 (2018-04-02)

- Added ability to take in servo values greater than 544 as part of servo class rewrite (thanks @dtex!)

## 2.0.2 (2017-11-22)

- Fixed a bug where the `digital-read-${pin}` event was being fired even when there was no change (thanks @boneskull!)

## 2.0.1 (2017-4-29)

- Fixed a bug in Servo duty cycle calculation

## 2.0.0 (2017-4-23)

- BREAKING CHANGE: Updated PWM value calculation to match breaking changes in raspi-pwm 4.0.0

## 1.1.1 (2017-4-7)

- Republishing because I accidentally had git out of sync

## 1.1.0 (2017-4-7)

- Added the `enableSerial` configuration option, which works the same as `enableSoftPwm`

## 1.0.2 (2017-2-17)

- Improved error messaging around unsupported pin modes

## 1.0.1 (2017-1-9)

- Fixed a bug with not being able to kill the process when run within Johnny-Five

## 1.0.0 (2016-12-30)

- Spun off raspi-io into raspi-io-core
- Reworked this module so that [Raspi.js](https://github.com/nebrius/raspi) is passed in to the constructor of raspi-io-core
  - The idea is that raspi-io will pass raspi.js to this module.

_Note:_ this codebase derives from the [Raspi IO](https://github.com/nebrius/raspi-io) codebase, so consider the [raspi-io changelog](https://github.com/nebrius/raspi-io/blob/master/CHANGELOG.md) to be historically precede this changelog up to version 7.1.0 of raspi-io.

## 2.4.0 (2019-2-20)

- Renamed to j5-io-types to avoid a name collision in the npm registry

## 2.3.0 (2019-2-7)

- Added port ID option to `createI2C` to differentiate between different I2C ports.

## 2.2.0 (2019-2-6)

- Made the error callback argument for serial methods optional

## 2.1.0 (2019-1-10)

- Added the `IPinInfo` types that are used by the Core IO constructor

## 2.0.1 (2019-1-9)

- Fixed a bug where I2C callbacks weren't _quite_ correct (callback data types weren't locked to the appropriate calls)

## 2.0.0 (2019-1-9)

- BREAKING CHANGE: Removed the `IBoardModule` and `IPinInfo` interfaces, as honestly they're internal details and don't belong here
- Added the `getPinNumber` method to the base module

## 1.4.0 (2019-1-8)

- Added `getActivePeripheral`, `setActivePeripheral`, and `getActivePeripherals` methods to the base module. This functionality existed in raspi-peripheral already, but wasn't exposed.

## 1.3.0 (2019-1-7)

- Added the `pullResistor` readonly property to `IDigitalInput`

## 1.2.0 (2018-12-7)

- Updated the `createPWM` method to take a number and string as well as config object

## 1.1.0 (2018-12-6)

- Added `frequency`, `range`, and `dutyCycle` readonly properties to IPWM

## 1.0.1 (2018-12-4)

- Renamed `IBoard` to `IBoardModule` and `IBase` to `IBaseModule`. Normally this should be semver major, but this module is so incredibly new  and I'm the only one using it, so I'm going to skip it this one time.

## 1.0.0 (2018-12-3)

- Initial version

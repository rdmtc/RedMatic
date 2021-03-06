## 1.6.0 (2019-3-11)

- Added missing overload for i2cWrite

## 1.5.1 (2019-2-20)

- Fixed a typo, now reads `Mode.UNKNOWN` instead of `Mode.UNKOWN`

## 1.5.0 (2019-2-6)

- Added the ability for the `value` property on the `pins` array to be equal to `null`, representing a non-GPIO pin

## 1.4.0 (2019-2-5)

- Added the ability to pass a string representing a pin (in addition to number) for `serverConfig`

## 1.3.0 (2019-1-11)

- Added `queryCapabilities`, `queryAnalogMapping`, and `queryPinState` methods

## 1.2.1 (2019-1-11)

- Fixed a bug where certain readonly properties weren't correctly reporting they are frozen objects/arrays

## 1.2.0 (2019-1-10)

- Normalized unsupported error messages to always say `reset is not supported by ${this.name}`

## 1.1.0 (2019-1-9)

- Added missing `SERIAL_PORT_IDs` property from the IO Plugin spec

## 1.0.1 (2019-1-7)

- Fixed a spelling error

## 1.0.0 (2018-12-11)

- Initial implementation

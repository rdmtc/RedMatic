## Configuring I2C on the Intel Edison Arduino Base Board

I2C bus 6 is broken out to the header pins labeled SDA and SCL on the Intel
Edison Arduino base board. The
[edison-i2c-config](https://github.com/fivdi/edison-i2c-config)
package can be used to configure this I2C bus:

```js
const i2cConfig = require('edison-i2c-config');

i2cConfig((err) => {
  if (err) {
    console.log('Sorry, something went wrong configuring I2C bus 6 :(');
  } else {
    console.log('Hey!, I2C bus 6 is ready for usage :)');
    console.log('Run "i2cdetect -y -r 6" to list the devices on bus 6');
  }
});
```


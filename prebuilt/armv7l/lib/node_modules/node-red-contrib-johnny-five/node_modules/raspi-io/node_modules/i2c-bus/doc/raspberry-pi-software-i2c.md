## Configuring Software I2C on the Raspberry Pi

Raspbian has a software I2C driver that can be enabled by adding the following
line to `/boot/config.txt`:

```
dtoverlay=i2c-gpio,bus=3
```

This will create an I2C bus called `/dev/i2c-3`. SDA will be on GPIO23 and SCL
will be on GPIO24 which are pins 16 and 18 on the GPIO header respectively.

For further information about `i2c-gpio` and the parameters it supports see
`/boot/overlays/README` on the Raspberry Pi.

The advantage of software I2C over hardware I2C on the Raspberry Pi is that
software I2C supports I2C clock stretching. Hardware I2C doesn't support I2C
clock stretching due to a
[hardware bug](http://www.advamation.com/knowhow/raspberrypi/rpi-i2c-bug.html).

Some devices like the BNO055 9-axis absolute orientation sensor rely on I2C
clock stretching and will not function correctly with hardware I2C on a
Raspberry Pi. Using software I2C to communicate with the BNO055 will resolve
this issue.

Another typical use case for software I2C is communication with AVR
microcontrollers, for example, the ATmega328P microcontroller on an Arduino
UNO. AVR microcontrollers are not particularly fast and it's relatively easy
to implement AVR code that relies on I2C clock stretching. Using software I2C
to communicate with the AVR will resolve I2C clock stretching issues.


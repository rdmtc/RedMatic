## Configuring I2C on the Raspberry Pi

This guide assumes that release 2015-01-31 or later of the Raspbian Operating
System is being used.

An I2C bus is broken out to pins 3 (SDA) and 5 (SCL) on the P1 header. The
number of steps that need to be performed to configure this I2C bus for usage
by user `pi` on Raspbian without root privileges is highly dependent in the
version of Raspbian being used.

### Configuring I2C with raspi-config

With Raspbian Jessie 2015-11-21 or later the complete configuration can be
performed with the `raspi-config` software configuration tool which can be run
from a terminal window as follows:

```
sudo raspi-config
```

In the `raspi-config` user interface navigate to `Interfacing Options >> I2C`
and answer the question `"Would you like the ARM I2C interface to be enabled?"`
with `<Yes>`. After the next reboot user `pi` will be able to use the I2C bus
without root privileges.

### Configuring I2C Manually

On older versions of Raspbian (prior to Raspbian Jessie 2015-11-21) the
`raspi-config` tool can still be used to configure the I2C bus, but additional
steps typically need to be performed.

#### Step 1 - Enable I2C

To enable I2C ensure that `/boot/config.txt` contains the following line:

```
dtparam=i2c_arm=on
```

#### Step 2 - Enable user space access to I2C

To enable userspace access to I2C ensure that `/etc/modules` contains the
following line:

```
i2c-dev
```

#### Step 3 - Setting the I2C baudrate

The default I2C baudrate is 100000. If required, this can be changed with the
`i2c_arm_baudrate` parameter. For example, to set the baudrate to 400000, add
the following line to `/boot/config.txt`:

```
dtparam=i2c_arm_baudrate=400000
```

#### Step 4 - I2C access without root privileges

If release 2015-05-05 or later of the Raspbian Operating System is being used,
this step can be skipped as user `pi` can access the I2C bus without root
privileges.

If an earlier release of the Raspbian Operating System is being used, create a
file called `99-i2c.rules` in directory `/etc/udev/rules.d` with the following
content:

```
SUBSYSTEM=="i2c-dev", MODE="0666"
```

This will give all users access to I2C and sudo need not be specified when
executing programs using i2c-bus. A more selective rule should be used if
required.

#### Step 5 - Reboot the Raspberry Pi

After performing the above steps, reboot the Raspberry Pi.


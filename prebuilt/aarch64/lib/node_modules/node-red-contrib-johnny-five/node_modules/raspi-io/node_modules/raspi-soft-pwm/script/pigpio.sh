#!/bin/sh
# The MIT License (MIT)
#
# Copyright (c) Bryan Hughes <bryan@nebri.us>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# Quick and dirty check to see if we're on a Raspberry Pi or not
if ! [ -f /proc/cpuinfo ]; then
  echo "not on a Raspberry Pi, skipping installation"
  exit 0
fi

if command -v pigpiod -v >/dev/null 2>&1
then
  echo "pigpio is already installed, skipping installation"
  exit 0
fi

echo "pigpio doesn't appear to be installed, installing now. You may be asked for your password."
sudo apt-get install pigpio

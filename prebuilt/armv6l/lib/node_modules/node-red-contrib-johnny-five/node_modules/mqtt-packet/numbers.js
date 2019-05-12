'use strict'

var Buffer = require('safe-buffer').Buffer
var max = 65536
var cache = {}

function generateBuffer (i) {
  var buffer = Buffer.allocUnsafe(2)
  buffer.writeUInt8(i >> 8, 0)
  buffer.writeUInt8(i & 0x00FF, 0 + 1)

  return buffer
}

function generateCache () {
  for (var i = 0; i < max; i++) {
    cache[i] = generateBuffer(i)
  }
}

module.exports = {
  cache: cache,
  generateCache: generateCache,
  generateNumber: generateBuffer
}

'use strict'

var bl = require('bl')
var inherits = require('inherits')
var EE = require('events').EventEmitter
var Packet = require('./packet')
var constants = require('./constants')
var debug = require('debug')('mqtt-packet:parser')

function Parser (opt) {
  if (!(this instanceof Parser)) return new Parser(opt)

  this.settings = opt || {}

  this._states = [
    '_parseHeader',
    '_parseLength',
    '_parsePayload',
    '_newPacket'
  ]

  this._resetState()
}

inherits(Parser, EE)

Parser.prototype._resetState = function () {
  debug('_resetState: resetting packet, error, _list, and _stateCounter')
  this.packet = new Packet()
  this.error = null
  this._list = bl()
  this._stateCounter = 0
}

Parser.prototype.parse = function (buf) {
  if (this.error) this._resetState()

  this._list.append(buf)
  debug('parse: current state: %s', this._states[this._stateCounter])
  while ((this.packet.length !== -1 || this._list.length > 0) &&
  this[this._states[this._stateCounter]]() &&
  !this.error) {
    this._stateCounter++
    debug('parse: state complete. _stateCounter is now: %d', this._stateCounter)
    debug('parse: packet.length: %d, buffer list length: %d', this.packet.length, this._list.length)
    if (this._stateCounter >= this._states.length) this._stateCounter = 0
  }
  debug('parse: exited while loop. packet: %d, buffer list length: %d', this.packet.length, this._list.length)
  return this._list.length
}

Parser.prototype._parseHeader = function () {
  // There is at least one byte in the buffer
  var zero = this._list.readUInt8(0)
  this.packet.cmd = constants.types[zero >> constants.CMD_SHIFT]
  this.packet.retain = (zero & constants.RETAIN_MASK) !== 0
  this.packet.qos = (zero >> constants.QOS_SHIFT) & constants.QOS_MASK
  this.packet.dup = (zero & constants.DUP_MASK) !== 0
  debug('_parseHeader: packet: %o', this.packet)

  this._list.consume(1)

  return true
}

Parser.prototype._parseLength = function () {
  // There is at least one byte in the list
  var result = this._parseVarByteNum(true)

  if (result) {
    this.packet.length = result.value
    this._list.consume(result.bytes)
  }
  debug('_parseLength %d', result.value)
  return !!result
}

Parser.prototype._parsePayload = function () {
  debug('_parsePayload: payload %O', this._list)
  var result = false

  // Do we have a payload? Do we have enough data to complete the payload?
  // PINGs have no payload
  if (this.packet.length === 0 || this._list.length >= this.packet.length) {
    this._pos = 0

    switch (this.packet.cmd) {
      case 'connect':
        this._parseConnect()
        break
      case 'connack':
        this._parseConnack()
        break
      case 'publish':
        this._parsePublish()
        break
      case 'puback':
      case 'pubrec':
      case 'pubrel':
      case 'pubcomp':
        this._parseConfirmation()
        break
      case 'subscribe':
        this._parseSubscribe()
        break
      case 'suback':
        this._parseSuback()
        break
      case 'unsubscribe':
        this._parseUnsubscribe()
        break
      case 'unsuback':
        this._parseUnsuback()
        break
      case 'pingreq':
      case 'pingresp':
        // These are empty, nothing to do
        break
      case 'disconnect':
        this._parseDisconnect()
        break
      case 'auth':
        this._parseAuth()
        break
      default:
        this._emitError(new Error('Not supported'))
    }

    result = true
  }
  debug('_parsePayload complete result: %s', result)
  return result
}

Parser.prototype._parseConnect = function () {
  debug('_parseConnect')
  var protocolId // Protocol ID
  var clientId // Client ID
  var topic // Will topic
  var payload // Will payload
  var password // Password
  var username // Username
  var flags = {}
  var packet = this.packet

  // Parse protocolId
  protocolId = this._parseString()

  if (protocolId === null) return this._emitError(new Error('Cannot parse protocolId'))
  if (protocolId !== 'MQTT' && protocolId !== 'MQIsdp') {
    return this._emitError(new Error('Invalid protocolId'))
  }

  packet.protocolId = protocolId

  // Parse constants version number
  if (this._pos >= this._list.length) return this._emitError(new Error('Packet too short'))

  packet.protocolVersion = this._list.readUInt8(this._pos)

  if (packet.protocolVersion !== 3 && packet.protocolVersion !== 4 && packet.protocolVersion !== 5) {
    return this._emitError(new Error('Invalid protocol version'))
  }

  this._pos++

  if (this._pos >= this._list.length) {
    return this._emitError(new Error('Packet too short'))
  }

  // Parse connect flags
  flags.username = (this._list.readUInt8(this._pos) & constants.USERNAME_MASK)
  flags.password = (this._list.readUInt8(this._pos) & constants.PASSWORD_MASK)
  flags.will = (this._list.readUInt8(this._pos) & constants.WILL_FLAG_MASK)

  if (flags.will) {
    packet.will = {}
    packet.will.retain = (this._list.readUInt8(this._pos) & constants.WILL_RETAIN_MASK) !== 0
    packet.will.qos = (this._list.readUInt8(this._pos) &
                          constants.WILL_QOS_MASK) >> constants.WILL_QOS_SHIFT
  }

  packet.clean = (this._list.readUInt8(this._pos) & constants.CLEAN_SESSION_MASK) !== 0
  this._pos++

  // Parse keepalive
  packet.keepalive = this._parseNum()
  if (packet.keepalive === -1) return this._emitError(new Error('Packet too short'))

  // parse properties
  if (packet.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }
  // Parse clientId
  clientId = this._parseString()
  if (clientId === null) return this._emitError(new Error('Packet too short'))
  packet.clientId = clientId
  debug('_parseConnect: packet.clientId: %s', packet.clientId)

  if (flags.will) {
    if (packet.protocolVersion === 5) {
      var willProperties = this._parseProperties()
      if (Object.getOwnPropertyNames(willProperties).length) {
        packet.will.properties = willProperties
      }
    }
    // Parse will topic
    topic = this._parseString()
    if (topic === null) return this._emitError(new Error('Cannot parse will topic'))
    packet.will.topic = topic
    debug('_parseConnect: packet.will.topic: %s', packet.will.topic)

    // Parse will payload
    payload = this._parseBuffer()
    if (payload === null) return this._emitError(new Error('Cannot parse will payload'))
    packet.will.payload = payload
    debug('_parseConnect: packet.will.paylaod: %s', packet.will.payload)
  }

  // Parse username
  if (flags.username) {
    username = this._parseString()
    if (username === null) return this._emitError(new Error('Cannot parse username'))
    packet.username = username
    debug('_parseConnect: packet.username: %s', packet.username)
  }

  // Parse password
  if (flags.password) {
    password = this._parseBuffer()
    if (password === null) return this._emitError(new Error('Cannot parse password'))
    packet.password = password
  }
  // need for right parse auth packet and self set up
  this.settings = packet
  debug('_parseConnect: complete')
  return packet
}

Parser.prototype._parseConnack = function () {
  debug('_parseConnack')
  var packet = this.packet

  if (this._list.length < 2) return null

  packet.sessionPresent = !!(this._list.readUInt8(this._pos++) & constants.SESSIONPRESENT_MASK)
  if (this.settings.protocolVersion === 5) {
    packet.reasonCode = this._list.readUInt8(this._pos++)
  } else {
    packet.returnCode = this._list.readUInt8(this._pos++)
  }

  if (packet.returnCode === -1 || packet.reasonCode === -1) return this._emitError(new Error('Cannot parse return code'))
  // mqtt 5 properties
  if (this.settings.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }
  debug('_parseConnack: complete')
}

Parser.prototype._parsePublish = function () {
  debug('_parsePublish')
  var packet = this.packet
  packet.topic = this._parseString()

  if (packet.topic === null) return this._emitError(new Error('Cannot parse topic'))

  // Parse messageId
  if (packet.qos > 0) if (!this._parseMessageId()) { return }

  // Properties mqtt 5
  if (this.settings.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }

  packet.payload = this._list.slice(this._pos, packet.length)
  debug('_parsePublish: payload from buffer list: %o', packet.payload)
}

Parser.prototype._parseSubscribe = function () {
  debug('_parseSubscribe')
  var packet = this.packet
  var topic
  var options
  var qos
  var rh
  var rap
  var nl
  var subscription

  if (packet.qos !== 1) {
    return this._emitError(new Error('Wrong subscribe header'))
  }

  packet.subscriptions = []

  if (!this._parseMessageId()) { return }

  // Properties mqtt 5
  if (this.settings.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }

  while (this._pos < packet.length) {
    // Parse topic
    topic = this._parseString()
    if (topic === null) return this._emitError(new Error('Cannot parse topic'))
    if (this._pos >= packet.length) return this._emitError(new Error('Malformed Subscribe Payload'))

    options = this._parseByte()
    qos = options & constants.SUBSCRIBE_OPTIONS_QOS_MASK
    nl = ((options >> constants.SUBSCRIBE_OPTIONS_NL_SHIFT) & constants.SUBSCRIBE_OPTIONS_NL_MASK) !== 0
    rap = ((options >> constants.SUBSCRIBE_OPTIONS_RAP_SHIFT) & constants.SUBSCRIBE_OPTIONS_RAP_MASK) !== 0
    rh = (options >> constants.SUBSCRIBE_OPTIONS_RH_SHIFT) & constants.SUBSCRIBE_OPTIONS_RH_MASK

    subscription = { topic: topic, qos: qos }

    // mqtt 5 options
    if (this.settings.protocolVersion === 5) {
      subscription.nl = nl
      subscription.rap = rap
      subscription.rh = rh
    }

    // Push pair to subscriptions
    debug('_parseSubscribe: push subscription `%s` to subscription', subscription)
    packet.subscriptions.push(subscription)
  }
}

Parser.prototype._parseSuback = function () {
  debug('_parseSuback')
  var packet = this.packet
  this.packet.granted = []

  if (!this._parseMessageId()) { return }

  // Properties mqtt 5
  if (this.settings.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }

  // Parse granted QoSes
  while (this._pos < this.packet.length) {
    this.packet.granted.push(this._list.readUInt8(this._pos++))
  }
}

Parser.prototype._parseUnsubscribe = function () {
  debug('_parseUnsubscribe')
  var packet = this.packet

  packet.unsubscriptions = []

  // Parse messageId
  if (!this._parseMessageId()) { return }

  // Properties mqtt 5
  if (this.settings.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }

  while (this._pos < packet.length) {
    var topic

    // Parse topic
    topic = this._parseString()
    if (topic === null) return this._emitError(new Error('Cannot parse topic'))

    // Push topic to unsubscriptions
    debug('_parseUnsubscribe: push topic `%s` to unsubscriptions', topic)
    packet.unsubscriptions.push(topic)
  }
}

Parser.prototype._parseUnsuback = function () {
  debug('_parseUnsuback')
  var packet = this.packet
  if (!this._parseMessageId()) return this._emitError(new Error('Cannot parse messageId'))
  // Properties mqtt 5
  if (this.settings.protocolVersion === 5) {
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
    // Parse granted QoSes
    packet.granted = []
    while (this._pos < this.packet.length) {
      this.packet.granted.push(this._list.readUInt8(this._pos++))
    }
  }
}

// parse packets like puback, pubrec, pubrel, pubcomp
Parser.prototype._parseConfirmation = function () {
  debug('_parseConfirmation: packet.cmd: `%s`', this.packet.cmd)
  var packet = this.packet

  this._parseMessageId()

  if (this.settings.protocolVersion === 5) {
    if (packet.length > 2) {
      // response code
      packet.reasonCode = this._parseByte()
      debug('_parseConfirmation: packet.reasonCode `%d`', packet.reasonCode)
    }

    if (packet.length > 3) {
      // properies mqtt 5
      var properties = this._parseProperties()
      if (Object.getOwnPropertyNames(properties).length) {
        packet.properties = properties
      }
    }
  }

  return true
}

// parse disconnect packet
Parser.prototype._parseDisconnect = function () {
  var packet = this.packet
  debug('_parseDisconnect')

  if (this.settings.protocolVersion === 5) {
    // response code
    packet.reasonCode = this._parseByte()
    // properies mqtt 5
    var properties = this._parseProperties()
    if (Object.getOwnPropertyNames(properties).length) {
      packet.properties = properties
    }
  }

  debug('_parseDisconnect result: true')
  return true
}

// parse auth packet
Parser.prototype._parseAuth = function () {
  debug('_parseAuth')
  var packet = this.packet

  if (this.settings.protocolVersion !== 5) {
    return this._emitError(new Error('Not supported auth packet for this version MQTT'))
  }

  // response code
  packet.reasonCode = this._parseByte()
  // properies mqtt 5
  var properties = this._parseProperties()
  if (Object.getOwnPropertyNames(properties).length) {
    packet.properties = properties
  }

  debug('_parseAuth: result: true')
  return true
}

Parser.prototype._parseMessageId = function () {
  var packet = this.packet

  packet.messageId = this._parseNum()

  if (packet.messageId === null) {
    this._emitError(new Error('Cannot parse messageId'))
    return false
  }

  debug('_parseMessageId: packet.messageId %d', packet.messageId)
  return true
}

Parser.prototype._parseString = function (maybeBuffer) {
  var length = this._parseNum()
  var result
  var end = length + this._pos

  if (length === -1 || end > this._list.length || end > this.packet.length) return null

  result = this._list.toString('utf8', this._pos, end)
  this._pos += length
  debug('_parseString: result: %s', result)
  return result
}

Parser.prototype._parseStringPair = function () {
  debug('_parseStringPair')
  return {
    name: this._parseString(),
    value: this._parseString()
  }
}

Parser.prototype._parseBuffer = function () {
  var length = this._parseNum()
  var result
  var end = length + this._pos

  if (length === -1 || end > this._list.length || end > this.packet.length) return null

  result = this._list.slice(this._pos, end)

  this._pos += length
  debug('_parseBuffer: result: %o', result)
  return result
}

Parser.prototype._parseNum = function () {
  if (this._list.length - this._pos < 2) return -1

  var result = this._list.readUInt16BE(this._pos)
  this._pos += 2
  debug('_parseNum: result: %s', result)
  return result
}

Parser.prototype._parse4ByteNum = function () {
  if (this._list.length - this._pos < 4) return -1

  var result = this._list.readUInt32BE(this._pos)
  this._pos += 4
  debug('_parse4ByteNum: result: %s', result)
  return result
}

Parser.prototype._parseVarByteNum = function (fullInfoFlag) {
  debug('_parseVarByteNum')
  var bytes = 0
  var mul = 1
  var length = 0
  var result = true
  var current
  var padding = this._pos ? this._pos : 0

  while (bytes < 5) {
    current = this._list.readUInt8(padding + bytes++)
    length += mul * (current & constants.LENGTH_MASK)
    mul *= 0x80

    if ((current & constants.LENGTH_FIN_MASK) === 0) break
    if (this._list.length <= bytes) {
      result = false
      break
    }
  }

  if (padding) {
    this._pos += bytes
  }

  result = result
    ? fullInfoFlag ? {
      bytes: bytes,
      value: length
    } : length
    : false

  debug('_parseVarByteNum: result: %o', result)
  return result
}

Parser.prototype._parseByte = function () {
  var result = this._list.readUInt8(this._pos)
  this._pos++
  debug('_parseByte: result: %o', result)
  return result
}

Parser.prototype._parseByType = function (type) {
  debug('_parseByType: type: %s', type)
  switch (type) {
    case 'byte': {
      return this._parseByte() !== 0
    }
    case 'int8': {
      return this._parseByte()
    }
    case 'int16': {
      return this._parseNum()
    }
    case 'int32': {
      return this._parse4ByteNum()
    }
    case 'var': {
      return this._parseVarByteNum()
    }
    case 'string': {
      return this._parseString()
    }
    case 'pair': {
      return this._parseStringPair()
    }
    case 'binary': {
      return this._parseBuffer()
    }
  }
}

Parser.prototype._parseProperties = function () {
  debug('_parseProperties')
  var length = this._parseVarByteNum()
  var start = this._pos
  var end = start + length
  var result = {}
  while (this._pos < end) {
    var type = this._parseByte()
    var name = constants.propertiesCodes[type]
    if (!name) {
      this._emitError(new Error('Unknown property'))
      return false
    }
    // user properties process
    if (name === 'userProperties') {
      if (!result[name]) {
        result[name] = {}
      }
      var currentUserProperty = this._parseByType(constants.propertiesTypes[name])
      if (result[name][currentUserProperty.name]) {
        if (Array.isArray(result[name][currentUserProperty.name])) {
          result[name][currentUserProperty.name].push(currentUserProperty.value)
        } else {
          var currentValue = result[name][currentUserProperty.name]
          result[name][currentUserProperty.name] = [currentValue]
          result[name][currentUserProperty.name].push(currentUserProperty.value)
        }
      } else {
        result[name][currentUserProperty.name] = currentUserProperty.value
      }
      continue
    }
    if (result[name]) {
      if (Array.isArray(result[name])) {
        result[name].push(this._parseByType(constants.propertiesTypes[name]))
      } else {
        result[name] = [result[name]]
        result[name].push(this._parseByType(constants.propertiesTypes[name]))
      }
    } else {
      result[name] = this._parseByType(constants.propertiesTypes[name])
    }
  }
  return result
}

Parser.prototype._newPacket = function () {
  debug('_newPacket')
  if (this.packet) {
    this._list.consume(this.packet.length)
    debug('_newPacket: parser emit packet: packet.cmd: %s, packet.payload: %s, packet.length: %d', this.packet.cmd, this.packet.payload, this.packet.length)
    this.emit('packet', this.packet)
  }
  debug('_newPacket: new packet')
  this.packet = new Packet()

  this._pos = 0

  return true
}

Parser.prototype._emitError = function (err) {
  debug('_emitError')
  this.error = err
  this.emit('error', err)
}

module.exports = Parser

var dgram = require('dgram');
var Buffer = require('buffer').Buffer;
var nodeConsole = console;

var DefaultHostname = require("os").hostname();
var DefaultAddress = "127.0.0.1";
var SingletonInstance = null;

var socket
var socketUsers = 0
var releaseTimeout
// HACK: On Node v0.11.x and v0.12.x bind the socket to ensure that it works when clustering
// This should be a temporary fix until node fixes the cluster module
var socketBindRequired = (function(){
    if(/^v0\.([0-9]|10)\..*$/.test(process.version)) {
      return false;
    }
    else {
      return true;
    }
})();

var socketErrorHandler = function (err) {

    if (err) {

        nodeConsole.error('socket error: ' + err)

    } else {

        nodeConsole.error('unknown socket error!')

    }



    if (socket !== undefined) {

        socket.close()

        socket = undefined

        socketUsers = 0

    }

}
var getSocket = function (type) {

    if (undefined === socket) {

        socket = dgram.createSocket(type);

        socket.on('error', socketErrorHandler)

        if (socketBindRequired && type == 'udp4') {
          socket.bind({
            port: 0,
            exclusive: true
          })
        }

    }

    ++socketUsers

    return socket

}
var releaseSocket = function () {

    --socketUsers

    if (0 == socketUsers && undefined === releaseTimeout) {

        releaseTimeout = setTimeout(function () {

            if (0 == socketUsers && socket !== undefined) {

                socket.close()

                socket = undefined

            }

            releaseTimeout = undefined

        }, 1000)

    }

}


var Transport = {
    UDP: function(message, severity, callback) {
        var self = this;
        var syslogMessage = this.composerFunction(message, severity);
        getSocket('udp4').send(syslogMessage,
                         0,
                         syslogMessage.length,
                         this.port,
                         this.address,
                         function(err, bytes) {
                             if(callback){
                                 callback(err, bytes);
                             }
                             self._logError(err, bytes);
                             releaseSocket();
                         }
                        );
    },
    unix_dgram: function(message, severity, callback){
        var self = this;
        var preambleBuffer = self.composerFunction('', severity);
        var formattedMessageBuffer = Buffer.isBuffer(message) ? message : new Buffer(message);
        var chunkSize = 2000 - preambleBuffer.length - 200;
        var numChunks = Math.ceil(formattedMessageBuffer.length / chunkSize);

        var fragments = [preambleBuffer];
        if (numChunks > 1){
            for (var i = 0; i < numChunks; i++){
                fragments.push(formattedMessageBuffer.slice(i * chunkSize, Math.min(formattedMessageBuffer.length, (i + 1) * chunkSize)),
                              new Buffer(' [' + (i + 1) + '/' + numChunks + ']', 'ascii'));
            }
        } else{
            fragments.push(formattedMessageBuffer);
        }

        var chunk = Buffer.concat(fragments);
        var socket = getSocket('unix_dgram');
        socket.send(chunk,
                    0,
                    chunk.length,
                    this.path,
                    function(err, bytes){
                        if(callback){
                          callback(err, bytes);
                        }
                        self._logError(err, bytes);
                        releaseSocket();
                    }
        );
    }
};

var Facility = {
    kern:   0,
    user:   1,
    mail:   2,
    daemon: 3,
    auth:   4,
    syslog: 5,
    lpr:    6,
    news:   7,
    uucp:   8,
    local0: 16,
    local1: 17,
    local2: 18,
    local3: 19,
    local4: 20,
    local5: 21,
    local6: 22,
    local7: 23
};

var Severity = {
    emerg:  0,
    alert:  1,
    crit:   2,
    err:    3,
    warn:   4,
    notice: 5,
    info:   6,
    debug:  7
};

// Format RegExp
var formatRegExp = /%[sdj]/g;

/**
 * Internal message formatting method
 * @param args [format, arg1, arg2, ...]
 * @returns
 */
function format(args) {
    var   util = require('util'),
    i    = 0,
    f    = args[0];

    // inspect the object if no format string was given as the first argument
    if (typeof f !== 'string') {
        var objects = [];
        for (i = 0; i < args.length; i++) {
            objects.push(util.inspect(args[i]));
        }
        return objects.join(' ');
    }


    i = 1;
    var str = String(f).replace(formatRegExp, function(x) {
        switch (x) {
            case '%s': return String(args[i++]);
            case '%d': return Number(args[i++]);
            case '%j': return JSON.stringify(args[i++]);
            default:
                return x;
        }
    });
    for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
        if (x === null || typeof x !== 'object') {
            str += ' ' + x;
        } else {
            str += ' ' + util.inspect(x);
        }
    }
    return str;
}

/**
 * Syslog logger
 * @constructor
 * @returns {SysLogger}
 */
function SysLogger(config) {
    this._times = {};
    this._logError = function(err, other) {
        if(err){
            nodeConsole.error('Cannot log message via %s:%d', this.hostname, this.port);
        }
    }.bind(this);
    this.set(config);
    return this;
}

/**
 * Get singleton instance of SysLogger.
 * @returns {SysLogger}
 */
SysLogger.getInstance = function() {
    if(!SingletonInstance){
        SingletonInstance = new SysLogger();
    }
    return SingletonInstance;
};

/**
 * Init function, takes a configuration object. If a hostname is provided the transport is assumed
 * to be Transport.UDP
 * @param {Object} configuration object with the following keys:
 *          - tag       - {String}                  By default is __filename
 *          - facility  - {Facility|Number|String}  By default is "user"
 *          - hostname  - {String}                  By default is require("os").hostname()
 *          - address   - {String}                  By default is 127.0.0.1
 *          - port      - {Number}                  Defaults to 514
 *          - transport - {Transport|String}        Defaults to Transport.UDP
 */
SysLogger.prototype.set = function(config) {
    config = config || {} ;

    this.setTag(config.tag);
    this.setFacility(config.facility);
    this.setHostname(config.hostname);
    this.setAddress(config.address);
    this.setPort(config.port);
    this.setPath(config.path);
    this.setMessageComposer(config.messageComposer);
    this.setTransport(Transport.UDP);

    return this;
};

SysLogger.prototype.setTransport = function(transport) {
    this.transport = transport || Transport.UDP;
    if (typeof this.transport === 'string') {
        this.transport = Transport[this.transport] ;
    }
    if (typeof this.path === 'string' && this.path.length > 0){
        this.transport = Transport.unix_dgram
    }
    return this;
};

SysLogger.prototype.setTag = function(tag) {
    this.tag = tag || __filename;
    return this;
};

SysLogger.prototype.setFacility = function(facility) {
    this.facility = facility || Facility.user;
    if (typeof this.facility == 'string'){
        this.facility = Facility[this.facility];
    }
    return this;
};

SysLogger.prototype.setAddress = function(address) {
    this.address = address || DefaultAddress;
    return this;
};

SysLogger.prototype.setHostname = function(hostname) {
    this.hostname = hostname || DefaultHostname;
    return this;
};

SysLogger.prototype.setPort = function(port) {
    this.port = port || 514;
    return this;
};

SysLogger.prototype.setPath = function(path) {
    this.path = path || '';

    if (typeof this.path === 'string' && this.path.length > 0){
        try {
            dgram = require('unix-dgram');
        } catch(err){
            throw new Error('unix-dgram module not installed, cannot specify a unix socket path');
        }
    }

    return this;
};

SysLogger.prototype.setMessageComposer = function(composerFunction){
    this.composerFunction = composerFunction || this.composeSyslogMessage;
    return this;
};

/**
 * Send message
 * @param {String} message
 * @param {Severity} severity
 */
SysLogger.prototype._send = function(message, severity, callback) {
    this.transport(message, severity, callback) ;
};

/**
 * Send formatted message to syslog
 * @param {String} message
 * @param {Number|String} severity
 */
SysLogger.prototype.send = function(message, severity, callback) {
    if (typeof severity == 'string'){
        severity = Severity[severity];
    }
    this._send(message, severity, callback);
};

SysLogger.prototype.formatAndSend = function(argumentsObject, severity) {
    var args          = Array.prototype.slice.call(argumentsObject);
    var callback      = undefined;
    var message       = undefined;


    if(Object.prototype.toString.call(args[args.length - 1]) == "[object Function]"){
      callback = args.pop();
    }
    this._send(format(args), severity, callback);
};




/**
 * Send log message with notice severity.
 */
SysLogger.prototype.log = function() {
    this.formatAndSend(arguments, Severity.notice);
};
/**
 * Send log message with info severity.
 */
SysLogger.prototype.info = function() {
    this.formatAndSend(arguments, Severity.info);
};
/**
 * Send log message with warn severity.
 */
SysLogger.prototype.warn = function() {
    this.formatAndSend(arguments, Severity.warn);
};
/**
 * Send log message with err severity.
 */
SysLogger.prototype.error = function() {
    this.formatAndSend(arguments, Severity.err);
};
/**
 * Send log message with debug severity.
 */
SysLogger.prototype.debug = function() {
    this.formatAndSend(arguments, Severity.debug);
};

/**
 * Log object with `util.inspect` with notice severity
 */
SysLogger.prototype.dir = function(object, callback) {
    var util = require('util');
    this._send(util.inspect(object) + '\n', Severity.notice);
};

SysLogger.prototype.trace = function(label, callback) {
    var err = new Error();
    err.name = 'Trace';
    err.message = label || '';
    Error.captureStackTrace(err, arguments.callee);
    this.error(err.stack, callback);
};

SysLogger.prototype.assert = function(expression) {
    if (!expression) {
        var arr = Array.prototype.slice.call(arguments, 1);
        this._send(format(arr), Severity.err);
    }
};


/**
 * Compose syslog message
 */
SysLogger.prototype.composeSyslogMessage = function(message, severity) {
    return new Buffer('<' + (this.facility * 8 + severity) + '>' +
                      this.getDate() + ' ' + this.hostname + ' ' +
                      this.tag + '[' + process.pid + ']:' + message);
}

SysLogger.prototype.time = function(label) {
    this._times[label] = Date.now();
};
SysLogger.prototype.timeEnd = function(label) {
    var duration = Date.now() - this._times[label];
    this.log('%s: %dms', label, duration);
};

/**
 * Get current date in syslog format.
 * @returns {String}
 */
SysLogger.prototype.getDate = function() {
    return new Date().toISOString();
}

SysLogger.prototype.leadZero = function(n) {
    if (n < 10) {
        return '0' + n;
    } else {
        return n;
    }
}

module.exports = SysLogger;

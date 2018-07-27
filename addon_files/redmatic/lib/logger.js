const Ain = require('ain2');

const ain = new Ain({
    tag: 'node-red',
    facility: 'daemon',
    path: '/dev/log'
});

const allowEmptyLine = false;

ain.setMessageComposer(function (message, severity) {
    return new Buffer('<' + (this.facility * 8 + severity) + '>' + this.tag + '[' + process.pid + ']: ' + message);
});

const levelNames = {
    10: 'crit', // fatal
    20: 'err',
    30: 'warn',
    40: 'info',
    50: 'debug',
    60: 'debug',  // trace
    98: 'debug', // audit
    99: 'info' // metric
};

module.exports = {
    logging: {
        ain: {
            handler: () => {
                return msg => {
                    if (msg && typeof msg.msg === 'string') {
                        const lines = msg.msg.split('\n');
                        lines.forEach(line => {
                            if (line || allowEmptyLine) {
                                const message = (msg.type ? '[' + msg.type + ':' + (msg.name || msg.id) + '] ' : '') + line;
                                ain.send(message, levelNames[msg.level]);
                            }
                        });
                    }
                }
            }
        }
    }
};

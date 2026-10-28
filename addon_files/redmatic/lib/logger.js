// Node-RED log handler that forwards log output to the CCU syslog through
// busybox `logger`, so Node-RED logs show up in /var/log/messages and the
// CCU web UI. One persistent logger child process per syslog severity keeps
// exact severities without needing a native syslog module.

const { spawn } = require('child_process');

const severities = {
    10: 'crit', // fatal
    20: 'err',
    30: 'warn',
    40: 'info',
    50: 'debug',
    60: 'debug', // trace
    98: 'debug', // audit
    99: 'info' // metric
};

const pipes = {};

function pipe(severity) {
    let p = pipes[severity];
    if (!p || p.exitCode !== null || !p.stdin.writable) {
        p = spawn('logger', ['-t', 'node-red[' + process.pid + ']', '-p', 'daemon.' + severity], {
            stdio: ['pipe', 'ignore', 'ignore']
        });
        p.on('error', () => {});
        p.stdin.on('error', () => {});
        pipes[severity] = p;
    }
    return p;
}

module.exports = {
    logging: {
        syslog: {
            handler: () => {
                return msg => {
                    if (msg && typeof msg.msg === 'string') {
                        let severity = severities[msg.level] || 'info';
                        // Node-RED says at warn level that the projects feature is off, which is
                        // RedMatic's default: information, not a warning (task 24)
                        if (msg.level === 30 && /^Projects disabled\b/.test(msg.msg)) {
                            severity = 'info';
                        }

                        for (const line of msg.msg.split('\n')) {
                            if (line) {
                                const message = (msg.type ? '[' + msg.type + ':' + (msg.name || msg.id) + '] ' : '') + line;
                                pipe(severity).stdin.write(message + '\n');
                            }
                        }
                    }
                };
            }
        }
    }
};

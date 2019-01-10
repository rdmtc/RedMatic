$(document).ready(() => {
    const bcrypt = dcodeIO.bcrypt;

    const $loglevel = $('#loglevel');
    const $contextStorageDefault = $('#context-storage-default');
    const $contextStorageFilePath = $('#context-storage-file-path');
    const $contextStorageFileInterval = $('#context-storage-file-interval');

    const $adminauthType = $('#adminauth-type');
    const $adminauthCreds = $('#adminauth-credentials');
    const $adminauthExpiry = $('#adminauth-expiry');
    const $adminauthSessionExpiryTime = $('#adminauth-sessionExpiryTime');
    const $adminauthUser = $('#adminauth-user');
    const $adminauthPass1 = $('#adminauth-pass1');
    const $adminauthPass2 = $('#adminauth-pass2');
    const $adminauthSet = $('#adminauth-set');

    const $nodeauthType = $('#nodeauth-type');
    const $nodeauthCreds = $('#nodeauth-credentials');
    const $nodeauthUser = $('#nodeauth-user');
    const $nodeauthPass1 = $('#nodeauth-pass1');
    const $nodeauthPass2 = $('#nodeauth-pass2');
    const $nodeauthSet = $('#nodeauth-set');
    
    const $staticauthType = $('#staticauth-type');
    const $staticauthCreds = $('#staticauth-credentials');
    const $staticauthUser = $('#staticauth-user');
    const $staticauthPass1 = $('#staticauth-pass1');
    const $staticauthPass2 = $('#staticauth-pass2');
    const $staticauthSet = $('#staticauth-set');

    const $projects = $('#projects');
    
    const $alertSaved = $('#alert-saved');
    const $alertError = $('#alert-error');
    const $alertExec = $('#alert-exec');

    const $status = $('#node-red-status');
    const $memory = $('#node-red-memory');
    const $cpu = $('#node-red-cpu');

    $alertSaved.hide();
    $alertError.hide();
    $alertExec.hide();

    const $restart = $('#restart');
    const $start = $('#start');
    const $stop = $('#stop');

    const $linkRed = $('#link-red');
    const $linkUi = $('#link-ui');

    let config;

    const qs = location.search;
    let sid = '';
    let tmp = qs.match(/sid=(@[0-9a-zA-Z]{10}@)/);
    if (tmp) {
        sid = tmp[1];
        $('#backup').removeClass('disabled').attr('href', 'backup.cgi?sid=' + sid);
    }

    let psTimeout;
    let psInterval = 5000;

    function cpu() {
        $.get(`service.cgi?sid=${sid}&cmd=cpu`, (data, success) => {
            $cpu.html(data ? 'cpu ' + data : '');
        });
    }

    function ps() {
        clearTimeout(psTimeout);
        $.get(`service.cgi?sid=${sid}&cmd=ps`, (data, success) => {
            cpu();
            const lines = data.split('\n');
            let found = false;
            lines.forEach(line => {
                let match;
                match = line.match(/([0-9]+[a-z]?)\s+([0-9]+[a-z]?)\s+node-red\s+node-red/);
                if (match) {
                    let [, vsz, rss] = match;
                    vsz = vsz.replace('m', 'MB').replace('g', 'GB');
                    rss = rss.replace('m', 'MB').replace('g', 'GB');
                    if (!vsz.endsWith('B')) {
                        vsz += 'kB';
                    }
                    if (!rss.endsWith('B')) {
                        rss += 'kB';
                    }
                    $status.html('<span class="status-running">running</span>');
                    $memory.html(`vsz ${vsz}, rss ${rss}`);
                    found = true;
                    $restart.removeClass('disabled');
                    $stop.removeClass('disabled');
                    $linkRed.removeClass('disabled');
                    $linkUi.removeClass('disabled');
                    $start.addClass('disabled');
                    psInterval = 5000;
                    return;
                }
                match = line.match(/([0-9]+[a-z]?)\s+([0-9]+[a-z]?)\s+.*red.js/);
                if (match) {
                    let [, vsz, rss] = match;
                    vsz = vsz.replace('m', 'MB').replace('g', 'GB');
                    rss = rss.replace('m', 'MB').replace('g', 'GB');
                    if (!vsz.endsWith('B')) {
                        vsz += 'kB';
                    }
                    if (!rss.endsWith('B')) {
                        rss += 'kB';
                    }
                    $status.html('<span class="status-starting">starting</span>');
                    $memory.html(`vsz ${vsz}, rss ${rss}`);
                    found = true;
                    $restart.addClass('disabled');
                    $stop.addClass('disabled');
                    $start.addClass('disabled');
                    $linkRed.addClass('disabled');
                    $linkUi.addClass('disabled');
                    psInterval = 2500;
                    return;
                }
            });
            if (!found) {
                $status.html('<span class="status-stopped">stopped</span>');
                $memory.html('');
                $restart.addClass('disabled');
                $stop.addClass('disabled');
                $start.removeClass('disabled');
                $linkRed.addClass('disabled');
                $linkUi.addClass('disabled');
                psInterval = 5000;
            }
            psTimeout = setTimeout(ps, psInterval);
        });
    }

    ps();

    function alert($elem) {
        $elem.show();
        $elem.addClass('show');
        setTimeout(() => {
            $elem.removeClass('show');
            setTimeout(() => {
                $elem.hide();
            }, 200);
        }, 1600);
    }

    function save() {
        console.log('save', config)
        $.post({
            url: 'setconfig.cgi' + location.search,
            data: JSON.stringify(config, null, '  '),
            success: function (data) {
                if ($.trim(data) === 'ok') {
                    alert($alertSaved);
                } else {
                    alert($alertError);
                }
            }
        }).fail(() => {
            alert($alertError);
        });
    }

    $.get('getconfig.cgi' + location.search, (data, success) => {
        config = JSON.parse(data);
        $loglevel.val(config.logging.ain.level);

        if (config.adminAuth) {
            $adminauthSessionExpiryTime.val(config.adminAuth.sessionExpiryTime || '604800');
            $adminauthType.val(config.adminAuth.type);
            if (config.adminAuth.type === 'credentials') {
                $adminauthCreds.show();
                $adminauthExpiry.show();
                $adminauthUser.val(config.adminAuth.users[0].username);

            } else if (config.adminAuth.type === 'rega') {
                $adminauthExpiry.show();
            }
        }

        if (config.httpNodeAuth) {
            $nodeauthType.val('basic');
            $nodeauthCreds.show();
            $nodeauthUser.val(config.httpNodeAuth.user);
        }

        if (config.httpStaticAuth) {
            $staticauthType.val('basic');
            $staticauthCreds.show();
            $staticauthUser.val(config.httpStaticAuth.user);
        }

        if (!config.contextStorage) {
            config.contextStorage = {};
        }
        if (!config.contextStorage.default || !config.contextStorage.default.module) {
            config.contextStorage.default = {module: 'memory'};
        }
        if (!config.contextStorage.memory) {
            config.contextStorage.memory = {
                'module': 'memory'
            };
        }
        if (!config.contextStorage.file) {
            config.contextStorage.file = {
                'module': 'localfilesystem',
                dir: '/usr/local/addons/redmatic/var',
                flushInterval: 30
            };
        }

        if (!config.editorTheme) {
            config.editorTheme = {};
        }
        if (!config.editorTheme.projects) {
            config.editorTheme.projects = {};
        }
        config.editorTheme.projects.enabled = config.editorTheme.projects.enabled || false;

        $projects.val(String(config.editorTheme.projects.enabled));

        if (config.editorTheme.projects.enabled) {
            $projects.prop('disabled', true);
        }

        // Migration from 1.x to 2.x
        if (config.contextStorage.default && config.contextStorage.default.module === 'localfilesystem') {
            config.contextStorage.default.module = 'file';
        }

        config.contextStorage.default.module = config.contextStorage.default.module || 'memory';

        updateContextTitle();

        $contextStorageDefault.val(config.contextStorage.default.module);

        $contextStorageFilePath.val(config.contextStorage.file.dir);
        $contextStorageFileInterval.val(config.contextStorage.file.flushInterval);

        $('#autorestart').find('option[value="' + config.restartOnCrash + '"]').attr('selected', true);

    });

    $loglevel.change(() => {
        config.logging.ain.level = $loglevel.val();
        save();
    });

    function updateContextTitle() {
        switch (config.contextStorage.default.module) {
            case 'memory':
                $('#context-file-title').html('file');
                $('#context-memory-title').html('default');
                break;
            case 'file':
                $('#context-file-title').html('default');
                $('#context-memory-title').html('memory');
                break;
            default:
        }
    }

    $projects.change(() => {
        config.editorTheme.projects.enabled = $projects.val() === 'true';
        save();
        if (config.editorTheme.projects.enabled) {
            $projects.prop('disabled', true)
        }
    });

    $contextStorageDefault.change(() => {
        if (!config.contextStorage) {
            config.contextStorage = {};
        }
        if (!config.contextStorage.default) {
            config.contextStorage.default = {};
        }

        config.contextStorage.default.module = $contextStorageDefault.val();
        updateContextTitle();

        save();
    });

    $adminauthSessionExpiryTime.change(() => {
        if (!config.adminAuth) {
            config.adminAuth = {};
        }
        const time = parseInt($adminauthSessionExpiryTime.val(), 10) || 604800;
        if (config.adminAuth.sessionExpiryTime !== time) {
            config.adminAuth.sessionExpiryTime = time;
            save();
        }
    });

    $adminauthType.change(() => {
        switch ($adminauthType.val()) {
            case 'credentials':
                $adminauthCreds.show();
                break;
            case 'rega':
                $adminauthExpiry.show();
                $adminauthCreds.hide();
                $adminauthUser.val('');
                if (!config.adminAuth) {
                    config.adminAuth = {};
                }
                delete config.adminAuth.users;
                config.adminAuth.type = 'rega';
                config.adminAuth.sessionExpiryTime = parseInt($adminauthSessionExpiryTime.val(), 10) || 604800;
                save();
                break;
            default:
                $adminauthExpiry.hide();
                $adminauthCreds.hide();
                $adminauthUser.val('');
                delete config.adminAuth;
                save();
        }
    });

    $nodeauthType.change(() => {
        switch ($nodeauthType.val()) {
            case 'basic':
                $nodeauthCreds.show();
                break;
            default:
                $nodeauthCreds.hide();
                $nodeauthUser.val('');
                delete config.httpNodeAuth;
                save();
        }
    });

    $staticauthType.change(() => {
        switch ($staticauthType.val()) {
            case 'basic':
                $staticauthCreds.show();
                break;
            default:
                $staticauthCreds.hide();
                $staticauthUser.val('');
                delete config.httpStaticAuth;
                save();
        }
    });

    $adminauthSet.click(() => {
        const user = $.trim($adminauthUser.val());
        const pw1 = $adminauthPass1.val();
        const pw2 = $adminauthPass2.val();

        let valid = true;

        if (!user) {
            $adminauthUser.addClass('is-invalid');
            valid = false;
        } else {
            $adminauthUser.removeClass('is-invalid');
        }

        if (!pw1 || pw1 !== pw2) {
            $adminauthPass1.addClass('is-invalid');
            $adminauthPass2.addClass('is-invalid');
            valid = false;
        } else {
            $adminauthPass1.removeClass('is-invalid');
            $adminauthPass2.removeClass('is-invalid');
        }

        if (valid) {
            config = Object.assign(config, {
                adminAuth: {
                    type: 'credentials',
                    sessionExpiryTime: parseInt($adminauthSessionExpiryTime.val(), 10) || 604800,
                    users: [{
                        username: user,
                        password: bcrypt.hashSync(pw1, 8),
                        permissions: '*'
                    }]
                }
            });
            save();
        }
    });

    $staticauthSet.click(() => {
        const user = $.trim($staticauthUser.val());
        const pw1 = $staticauthPass1.val();
        const pw2 = $staticauthPass2.val();

        let valid = true;

        if (!user) {
            $staticauthUser.addClass('is-invalid');
            valid = false;
        } else {
            $staticauthUser.removeClass('is-invalid');
        }

        if (!pw1 || pw1 !== pw2) {
            $staticauthPass1.addClass('is-invalid');
            $staticauthPass2.addClass('is-invalid');
            valid = false;
        } else {
            $staticauthPass1.removeClass('is-invalid');
            $staticauthPass2.removeClass('is-invalid');
        }

        if (valid) {
            config = Object.assign(config, {
                httpStaticAuth: {
                    user,
                    pass: bcrypt.hashSync(pw1, 8),
                }
            });
            save();
        }
    });

    $nodeauthSet.click(() => {
        const user = $.trim($nodeauthUser.val());
        const pw1 = $nodeauthPass1.val();
        const pw2 = $nodeauthPass2.val();

        let valid = true;

        if (!user) {
            $nodeauthUser.addClass('is-invalid');
            valid = false;
        } else {
            $nodeauthUser.removeClass('is-invalid');
        }

        if (!pw1 || pw1 !== pw2) {
            $nodeauthPass1.addClass('is-invalid');
            $nodeauthPass2.addClass('is-invalid');
            valid = false;
        } else {
            $nodeauthPass1.removeClass('is-invalid');
            $nodeauthPass2.removeClass('is-invalid');
        }

        if (valid) {
            config = Object.assign(config, {
                httpNodeAuth: {
                    user,
                    pass: bcrypt.hashSync(pw1, 8),
                }
            });
            save();
        }
    });

    $restart.click(() => {
        clearTimeout(psTimeout);
        $restart.addClass('disabled');
        $stop.addClass('disabled');
        $start.addClass('disabled');
        $status.html('<span class="status-starting">stopping</span>');
        $memory.html('');
        $.get({
            url: `service.cgi?sid=${sid}&cmd=restart`,
            success: data => {
                if (data.match(/Starting Node-RED: OK/)) {
                    psInterval = 2000;
                    setTimeout(() => {
                        ps();
                    }, 6000);
                    alert($alertExec);
                } else {
                    alert($alertError);
                }
            }
        });
    });

    $start.click(() => {
        $restart.addClass('disabled');
        $stop.addClass('disabled');
        $start.addClass('disabled');
        $status.html('<span class="status-starting">starting</span>');
        $memory.html('');
        $.get({
            url: `service.cgi?sid=${sid}&cmd=start`,
            success: data => {
                if (data.match(/Starting Node-RED: OK/)) {
                    psInterval = 2000;
                    setTimeout(() => {
                        ps();
                    }, 6000);
                    alert($alertExec);
                } else {
                    alert($alertError);
                }
            }
        });
    });

    $stop.click(() => {
        clearTimeout(psTimeout);
        $restart.addClass('disabled');
        $stop.addClass('disabled');
        $start.addClass('disabled');
        $status.html('<span class="status-starting">stopping</span>');
        $memory.html('');
        $.get({
            url: `service.cgi?sid=${sid}&cmd=stop`,
            success: data => {
                if (data.match(/Stopping Node-RED: OK/)) {
                    alert($alertExec);
                    psInterval = 2000;
                    setTimeout(() => {
                        ps();
                    }, 6000);
                } else {
                    alert($alertError);
                }
            }
        });
    });

    function setHeader(xhr) {
        xhr.setRequestHeader('accept', 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*');
    }

    $.get('restart_count', data => {
        $('#restarts').html(data || 'keine');
    });

    function download(filename, dataUrl) {
        let link = document.createElement("a");
        link.download = filename;
        link.target = "_blank";

        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }

    $('#log').on('click', () => {
        download('redmatic.' + (new Date()).toISOString() + '.log', 'log.cgi' + location.search);
    });

    $('#autorestart').on('change', event => {
        config.restartOnCrash = parseInt(event.target.value, 10);
        save();
    });

});


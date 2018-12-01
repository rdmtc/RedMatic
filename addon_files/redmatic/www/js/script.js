$(document).ready(() => {
    const bcrypt = dcodeIO.bcrypt;

    const $loglevel = $('#loglevel');
    const $contextStorage = $('#context-storage');

    const $adminauthType = $('#adminauth-type');
    const $adminauthCreds = $('#adminauth-credentials');
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
    
    const $alertSaved = $('#alert-saved');
    const $alertError = $('#alert-error');
    const $alertExec = $('#alert-exec');

    const $status = $('#node-red-status');
    const $memory = $('#node-red-memory');

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

    function ps() {
        clearTimeout(psTimeout);
        $.get(`service.cgi?sid=${sid}&cmd=ps`, (data, success) => {
            console.log(data);
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
                    psInterval = 10000;
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
                psInterval = 10000;
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
        $contextStorage.val(config.contextStorage.default.module);

        if (config.adminAuth) {
            $adminauthType.val(config.adminAuth.type);
            $adminauthCreds.show();
            $adminauthUser.val(config.adminAuth.users[0].username);
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

    });

    $loglevel.change(() => {
        config.logging.ain.level = $loglevel.val();
        save();
    });

    $contextStorage.change(() => {
        if (!config.contextStorage) {
            config.contextStorage = {default: {}};
        }
        config.contextStorage.default.module = $contextStorage.val();
        save();
    });

    $adminauthType.change(() => {
        switch ($adminauthType.val()) {
            case 'credentials':
                $adminauthCreds.show();
                break;
            default:
                $adminauthCreds.hide();
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
                    }, 3000);
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
                    ps();
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
                    }, 3000);
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

});


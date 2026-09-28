export PATH=/usr/local/addons/redmatic/bin:$PATH
export HOME=/usr/local/addons/redmatic/home
export NO_UPDATE_NOTIFIER=true

# openccu-lite: no npm debug log files in var/npm-cache/_logs, as in
# bin/redmatic's start (the markers: a LITE= line in /VERSION, or occulited)
if grep -q '^LITE=' /VERSION 2>/dev/null || [ -x /usr/bin/occulited ]; then
    export npm_config_logs_max=0
fi
export GIT_EXEC_PATH=/usr/local/addons/redmatic/libexec/git-core
export GIT_TEMPLATE_DIR=/usr/local/addons/redmatic/share/git-core/templates

# provides NODE_VERSION, VERSION_ADDON, RED_VERSION and (armv7l) ICU_DATA
[ -f /usr/local/addons/redmatic/versions ] && . /usr/local/addons/redmatic/versions

# user-supplied additional CA certificates (#46)
if [ -f /usr/local/addons/redmatic/etc/extra-ca-certs.pem ]; then
    export NODE_EXTRA_CA_CERTS=/usr/local/addons/redmatic/etc/extra-ca-certs.pem
fi
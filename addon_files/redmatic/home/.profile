export PATH=/usr/local/addons/redmatic/bin:$PATH
export HOME=/usr/local/addons/redmatic/home
export NO_UPDATE_NOTIFIER=true
export GIT_EXEC_PATH=/usr/local/addons/redmatic/libexec/git-core
export GIT_TEMPLATE_DIR=/usr/local/addons/redmatic/share/git-core/templates

# provides NODE_VERSION, VERSION_ADDON, RED_VERSION and (armv7l) ICU_DATA
[ -f /usr/local/addons/redmatic/versions ] && . /usr/local/addons/redmatic/versions

# user-supplied additional CA certificates (#46)
if [ -f /usr/local/addons/redmatic/etc/extra-ca-certs.pem ]; then
    export NODE_EXTRA_CA_CERTS=/usr/local/addons/redmatic/etc/extra-ca-certs.pem
fi
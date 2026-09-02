export PATH=/usr/local/addons/redmatic/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/addons/redmatic/lib:/usr/lib:/usr/local/lib
export HOME=/usr/local/addons/redmatic/home
export NO_UPDATE_NOTIFIER=true

# provides NODE_VERSION, VERSION_ADDON, RED_VERSION and (armv7l) ICU_DATA
[ -f /usr/local/addons/redmatic/versions ] && . /usr/local/addons/redmatic/versions
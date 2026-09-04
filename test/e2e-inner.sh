#!/bin/bash
#
# Runs inside the e2e container (see test/e2e.sh): installs the x86_64
# package like OpenCCU's /bin/install_addon does and checks the result.

ADDON_DIR=/usr/local/addons/redmatic
CONF_DIR=/usr/local/etc/config
RED=http://127.0.0.1:1880/addons/red
PKG=`ls /dist/redmatic-x86_64-*.tar.gz | head -1`
FAILED=0

log() { echo ""; echo "### $*"; }
ok() { echo "ok: $*"; }
fail() { echo "FAIL: $*"; FAILED=1; }
die() { echo "FAIL: $*"; dump; exit 1; }

dump() {
    echo ""
    echo "### syslog (last 60 lines)"
    tail -60 /var/log/messages 2>/dev/null
}

# --- container preparation ---------------------------------------------------
log "prepare container"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq >/dev/null || die "apt-get update"
apt-get install -y -qq --no-install-recommends curl ca-certificates iproute2 procps busybox uuid-runtime >/dev/null || die "apt-get install"
echo "127.0.0.1 telemetry.redmatic.de" >> /etc/hosts
busybox syslogd -O /var/log/messages || die "syslogd"
mkdir -p /usr/local/tmp $CONF_DIR/rc.d /etc/config
# the CCU runs the addon scripts with busybox ash, not dash
ln -sf /bin/busybox /bin/sh
ok "$PKG"

# what OpenCCU's /bin/install_addon does: extract into a temp dir below
# /usr/local/tmp, run update_script from inside it, delete the temp dir
install_addon() {
    local dir rc
    dir=`mktemp -d -p /usr/local/tmp`
    tar -C "$dir" --no-same-owner --no-same-permissions -xf "$PKG" || die "extract"
    (cd "$dir" && ./update_script HM-RASPBERRYMATIC >/tmp/update_script.log 2>&1)
    rc=$?
    rm -rf "$dir"
    return $rc
}

wait_for_node_red() {
    local i
    for i in `seq 1 60`; do
        if curl -s -o /dev/null -w '%{http_code}' $RED/ 2>/dev/null | grep -q '^200$'; then
            return 0
        fi
        sleep 2
    done
    return 1
}

settings() {
    curl -s $RED/settings
}

node_red_pid() {
    pgrep -x node-red | head -1
}

check_running() {
    local pid cwd
    wait_for_node_red || die "Node-RED did not answer on $RED/ within 120 s"
    ok "Node-RED answers on $RED/"

    pid=`node_red_pid`
    [ -n "$pid" ] || die "no node-red process"
    cwd=`readlink /proc/$pid/cwd`
    if [ "$cwd" = "/" ]; then
        ok "working directory of the Node-RED process is / (#599)"
    else
        fail "working directory of the Node-RED process is '$cwd', expected / (#599)"
    fi

    if settings | $ADDON_DIR/bin/node -e '
        let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
            const j = JSON.parse(s);
            const install = j.externalModules && j.externalModules.palette && j.externalModules.palette.allowInstall;
            console.log("Node-RED " + j.version + ", palette allowInstall=" + install);
            process.exit(install === false ? 1 : 0);
        })'; then
        ok "palette editor enabled"
    else
        fail "palette editor disabled (externalModules.palette.allowInstall=false)"
    fi

    if grep -q "Palette editor disabled" /var/log/messages 2>/dev/null; then
        fail "syslog contains 'Palette editor disabled'"
    fi

    if curl -s -H 'Accept: application/json' $RED/nodes | $ADDON_DIR/bin/node -e '
        let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
            const sets = JSON.parse(s).filter(n => n.module === "node-red-contrib-ccu");
            const types = sets.flatMap(n => n.types);
            const broken = sets.filter(n => n.err || n.enabled === false);
            console.log("node-red-contrib-ccu " + (sets[0] || {}).version + ": " + types.length + " node types");
            process.exit(types.length >= 10 && broken.length === 0 ? 0 : 1);
        })'; then
        ok "node-red-contrib-ccu loaded"
    else
        fail "node-red-contrib-ccu missing or broken"
    fi
}

# --- fresh install -----------------------------------------------------------
log "fresh install (update_script must exit 10 = reboot required)"
install_addon
rc=$?
[ $rc -eq 10 ] || { cat /tmp/update_script.log; die "update_script exit code $rc, expected 10"; }
ok "update_script exit 10"
[ -x $CONF_DIR/rc.d/redmatic ] || die "rc.d/redmatic link missing"
[ -f $ADDON_DIR/etc/settings.json ] || die "etc/settings.json missing"
. $ADDON_DIR/versions
ok "addon $VERSION_ADDON, Node.js $NODE_VERSION, Node-RED $RED_VERSION"

# no CCU here: switch off the rega login (etc/settings-user.js is merged last
# by lib/settings.js and survives updates)
echo "module.exports = { adminAuth: undefined };" > $ADDON_DIR/etc/settings-user.js

log "start"
$CONF_DIR/rc.d/redmatic start || die "rc.d/redmatic start"
check_running

# --- update (the OpenCCU live path that broke #599) ---------------------------
log "update with the same package (update_script must exit 0 and restart the service)"
install_addon
rc=$?
[ $rc -eq 0 ] || { cat /tmp/update_script.log; die "update_script exit code $rc, expected 0"; }
ok "update_script exit 0"
sleep 3
check_running
grep -q '"node-red-contrib-ccu"' $ADDON_DIR/var/package.json || fail "var/package.json lost node-red-contrib-ccu in the merge"

# --- palette install / uninstall ---------------------------------------------
log "palette install node-red-node-random"
code=`curl -s -o /tmp/install.json -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d '{"module":"node-red-node-random"}' $RED/nodes`
if [ "$code" = "200" ] && grep -q '"random"' /tmp/install.json; then
    ok "installed via the palette API"
else
    echo "response $code: `head -c 400 /tmp/install.json`"
    fail "palette install failed"
fi
if [ -d $ADDON_DIR/var/node_modules/node-red-node-random ]; then
    ok "module landed in var/node_modules"
else
    fail "var/node_modules/node-red-node-random missing"
fi
if [ -f $ADDON_DIR/var/package-lock.json ]; then
    fail "package-lock.json written in var (npmrc package-lock=false not honoured)"
fi

log "palette uninstall node-red-node-random"
code=`curl -s -o /dev/null -w '%{http_code}' -X DELETE $RED/nodes/node-red-node-random`
if [ "$code" = "204" ] && [ ! -d $ADDON_DIR/var/node_modules/node-red-node-random ]; then
    ok "removed via the palette API"
else
    fail "palette uninstall failed (http $code)"
fi

# --- stop -----------------------------------------------------------------------
log "stop"
$CONF_DIR/rc.d/redmatic stop
sleep 2
if [ -z "`node_red_pid`" ]; then
    ok "Node-RED stopped"
else
    fail "Node-RED still running after stop"
fi

dump
echo ""
if [ $FAILED -eq 0 ]; then
    echo "### e2e: PASSED ($VERSION_ADDON)"
    exit 0
fi
echo "### e2e: FAILED ($VERSION_ADDON)"
exit 1

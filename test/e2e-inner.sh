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
# libatomic1: nodejs.org's binaries need libatomic.so.1 since Node 25; OpenCCU and
# openccu-lite ship it in /lib, a slim Debian image does not
apt-get install -y -qq --no-install-recommends curl ca-certificates iproute2 procps busybox uuid-runtime libatomic1 >/dev/null || die "apt-get install"
echo "127.0.0.1 telemetry.redmatic.de" >> /etc/hosts
busybox syslogd -O /var/log/messages || die "syslogd"
mkdir -p /usr/local/tmp $CONF_DIR/rc.d /etc/config
# the CCU runs the addon scripts with busybox ash, not dash
ln -sf /bin/busybox /bin/sh
ok "$PKG"

# the published .sha256 files must verify next to a downloaded package: the
# name only, no build path (they named the runner's dist directory until 9.7.1)
log "checksum files"
(cd /dist && sha256sum -c *.sha256) || die "sha256sum -c in the package directory"
ok "sha256sum -c"

# what OpenCCU's /bin/install_addon does: extract into a temp dir below
# /usr/local/tmp, run update_script from inside it, delete the temp dir
install_addon() {
    local dir rc
    dir=`mktemp -d -p /usr/local/tmp`
    tar -C "$dir" --no-same-owner --no-same-permissions -xf "$PKG" || die "extract"
    (cd "$dir" && ./update_script HM-RASPBERRYMATIC >/tmp/update_script.log 2>&1)
    rc=$?
    # the big parts update_script moves instead of copying: what is left of them in the package
    INSTALL_LEFT=`cd "$dir/redmatic" && ls -d bin/node include lib/node_modules www/node_modules 2>/dev/null | tr '\n' ' '`
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

    if [ -e /tmp/red-settings.json ]; then
        fail "/tmp/red-settings.json exists (lib/settings.js must not write it, bug 8)"
    else
        ok "no /tmp/red-settings.json"
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

# the telemetry id (bug 11): a CCU and OpenCCU keep it in /etc/config
[ -s /etc/config/rdmtc.uuid ] && ok "telemetry id in /etc/config" || fail "no /etc/config/rdmtc.uuid after the first start"
[ -e $ADDON_DIR/var/rdmtc.uuid ] && fail "var/rdmtc.uuid written outside openccu-lite"

# --- update (the OpenCCU live path that broke #599) ---------------------------
log "update with the same package (update_script must exit 0 and restart the service)"
# what the log upload of 9.10.0 and earlier left on the system (task 19)
UPLOAD_FILES="bin/redmatic-logupload www/logupload.cgi www/getnick.cgi www/setnick.cgi etc/nickname"
for f in $UPLOAD_FILES; do echo old > $ADDON_DIR/$f; done
install_addon
rc=$?
[ $rc -eq 0 ] || { cat /tmp/update_script.log; die "update_script exit code $rc, expected 0"; }
ok "update_script exit 0"
# moved into place, not copied a second time (fewer SD card writes); a stale file in an owned tree goes
[ -z "$INSTALL_LEFT" ] && ok "node, headers and modules moved into place" || fail "update_script copied instead of moving: $INSTALL_LEFT"
for f in bin/node include/node/node.h lib/node_modules/node-red/red.js www/node_modules/jquery; do
    [ -e $ADDON_DIR/$f ] || fail "$f missing after the update"
done
sleep 3
check_running
grep -q '"node-red-contrib-ccu"' $ADDON_DIR/var/package.json || fail "var/package.json lost node-red-contrib-ccu in the merge"
left=""
for f in $UPLOAD_FILES; do [ -e $ADDON_DIR/$f ] && left="$left $f"; done
[ -z "$left" ] && ok "the log upload of an earlier version removed" || fail "left after the update:$left"
grep -rl "telemetry.redmatic.de/" $ADDON_DIR/bin $ADDON_DIR/www $ADDON_DIR/lib/*.js $ADDON_DIR/lib/*.tcl 2>/dev/null &&
    fail "a file of the installed addon sends to a path of the telemetry host" || ok "nothing sends to a path of the telemetry host"

# --- update on openccu-lite (bug 8, bug 16) ------------------------------------
# A pretend openccu-lite: /VERSION with a LITE= line and a systemctl that records
# its calls and plays the unit (runs rc.d/redmatic as a child, so the start log
# names it as the caller). update_script must stop through addon-redmatic.service
# instead of calling rc.d/redmatic itself, start nothing at all (occulited starts
# the unit once the installer is through - played here by the test), and remove
# the /tmp/red-settings.json of an earlier version.
# With /tmp/systemctl.skip-start present, the next start is recorded but does nothing
# (a unit start that did not bring Node-RED up), and the flag is removed.
lite_on() {
    cat > /usr/local/bin/systemctl <<'EOF'
#!/bin/sh
echo "$*" >> /tmp/systemctl.log
case "$1" in
    show) if [ "$4" = addon-redmatic.service ]; then echo LoadState=loaded; else echo LoadState=not-found; fi ;;
    start|stop)
        if [ "$1" = start ] && [ -f /tmp/systemctl.skip-start ]; then
            rm -f /tmp/systemctl.skip-start
            exit 0
        fi
        /usr/local/etc/config/rc.d/redmatic "$1"; exit $? ;;
esac
EOF
    chmod 755 /usr/local/bin/systemctl
    printf 'VERSION=3.89.8\nPRODUCT=e2e\nLITE=1.0.0-e2e\n' > /VERSION
    : > /tmp/systemctl.log
}

lite_off() {
    rm -f /usr/local/bin/systemctl /VERSION /tmp/systemctl.log /tmp/systemctl.skip-start
}

# the last start `bin/redmatic` logged, and who asked for it
last_accepted_start() {
    grep "start requested by pid" /var/log/messages | tail -1
}

# the telemetry body (task 18): the e2e blocks the telemetry host, so check what
# bin/redmaticVersions builds - the JSON bin/redmatic posts and update_check.cgi serves.
# Prints PRODUCT|LITE of the ccu block, and "top-level LITE" if the key is anywhere else.
telemetry_ccu() {
    $ADDON_DIR/bin/redmaticVersions | $ADDON_DIR/bin/node -e '
        const b = JSON.parse(require("fs").readFileSync(0, "utf8"));
        if ("LITE" in b) console.log("top-level LITE");
        console.log(b.ccu.PRODUCT + "|" + ("LITE" in b.ccu ? b.ccu.LITE : "(none)"));'
}

# Node-RED's environment: what npm, started from it, inherits
node_red_env() {
    tr '\0' '\n' < /proc/`node_red_pid`/environ
}

log "update on a pretend openccu-lite (stop through addon-redmatic.service, no start by the installer)"
lite_on
# npm debug logs of earlier runs (task 13)
mkdir -p $ADDON_DIR/var/npm-cache/_logs
echo old > $ADDON_DIR/var/npm-cache/_logs/2026-01-01T00_00_00_000Z-debug-0.log
echo '{"credentialSecret":"left by an earlier version"}' > /tmp/red-settings.json
chown nobody /tmp/red-settings.json
install_addon
rc=$?
[ $rc -eq 0 ] || { cat /tmp/update_script.log; die "update_script exit code $rc, expected 0"; }
ok "update_script exit 0"
echo "--- systemctl calls"; cat /tmp/systemctl.log
grep -q '^stop addon-redmatic.service$' /tmp/systemctl.log && ok "stopped through the unit" || fail "update_script did not stop addon-redmatic.service"
grep -q '^start addon-redmatic.service$' /tmp/systemctl.log && fail "update_script started addon-redmatic.service itself (occulited does that)" || ok "update_script started nothing through the unit"
grep -q "the system starts the addon's unit" /tmp/update_script.log && ok "update_script left the start to the system" || fail "update_script did not say that the system starts the unit"
[ -n "`node_red_pid`" ] && fail "Node-RED runs after the installer although nothing may start it there (bug 16)" || ok "nothing started Node-RED from the installer"
# what occulited does once the installer is through
systemctl start addon-redmatic.service
sleep 3
check_running
last_accepted_start | grep -q "systemctl start addon-redmatic.service" &&
    ok "the accepted start came from the unit" || fail "the last accepted start did not come from systemctl: `last_accepted_start`"
# the telemetry id (bug 11): on openccu-lite in var/, taken over from /etc/config
if [ -s $ADDON_DIR/var/rdmtc.uuid ] && cmp -s /etc/config/rdmtc.uuid $ADDON_DIR/var/rdmtc.uuid; then
    ok "telemetry id taken over into var/rdmtc.uuid"
else
    fail "var/rdmtc.uuid missing or not the id of /etc/config"
fi
# no log files of npm's (task 13)
node_red_env | grep -qx 'npm_config_logs_max=0' && ok "Node-RED passes npm logs-max=0 on" || fail "Node-RED's environment has no npm_config_logs_max=0"
ls $ADDON_DIR/var/npm-cache/_logs/*.log >/dev/null 2>&1 && fail "npm debug logs left in var/npm-cache/_logs: `ls $ADDON_DIR/var/npm-cache/_logs`" || ok "no npm debug logs in var/npm-cache/_logs"
grep -q "rdmtc.uuid" /tmp/update_script.log /var/log/messages && fail "a message about rdmtc.uuid: `grep -h rdmtc.uuid /tmp/update_script.log /var/log/messages | head -2`"
body=`telemetry_ccu`
[ "$body" = "lite-e2e|1.0.0-e2e" ] && ok "telemetry: PRODUCT lite-e2e, LITE 1.0.0-e2e in ccu" || fail "telemetry ccu block on openccu-lite: $body"
lite_off
printf 'VERSION=3.83.6\nPRODUCT=raspmatic_rpi4\nPLATFORM=rpi4\n' > /VERSION
body=`telemetry_ccu`
[ "$body" = "raspmatic_rpi4|(none)" ] && ok "telemetry: an OpenCCU's PRODUCT unchanged, no LITE" || fail "telemetry ccu block on OpenCCU: $body"
rm -f /VERSION

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
# npm's cache on the storage by default: etc/npmrc's var/npm-cache
node_red_env | grep -q '^npm_config_cache=' && fail "npm_config_cache set although the default is the storage" || ok "storage (default): Node-RED's npm keeps etc/npmrc's cache"
[ -d $ADDON_DIR/var/npm-cache/_cacache ] && ok "storage (default): the palette install cached in var/npm-cache" || fail "storage (default): no var/npm-cache/_cacache after the palette install"
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

# --- RedMatic-HomeKit and RedMatic-Matter after a RedMatic update -------------------
# lib/update-redmatic-nodes.js, started by the loader beside Node-RED: at the first start after a
# RedMatic update the two packages are updated when they are installed and the setting is on (also
# without a stored value), and Node-RED restarts once. The package installed here is the one that is
# running, so "an update" is played by a state file that names another RedMatic version.
NODES_STATE=$ADDON_DIR/var/redmatic-nodes-update.json
HOMEKIT_OLD=4.1.4
MATTER_OLD=1.0.1
nodes_state() {
    $ADDON_DIR/bin/node -e 'try { console.log(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).state) } catch { console.log("none") }' $NODES_STATE
}
module_version() {
    $ADDON_DIR/bin/node -e 'try { console.log(require(process.argv[1]).version) } catch { console.log("missing") }' $ADDON_DIR/var/node_modules/$1/package.json
}
set_update_nodes() {
    $ADDON_DIR/bin/node -e '
        const fs = require("fs");
        const [file, value] = process.argv.slice(1);
        const s = JSON.parse(fs.readFileSync(file, "utf8"));
        if (value === "unset") delete s.updateRedmaticNodes; else s.updateRedmaticNodes = value === "true";
        fs.writeFileSync(file, JSON.stringify(s, null, 2));' $ADDON_DIR/etc/settings.json "$1"
}
# $1 the state to wait for, $2 seconds
wait_for_nodes_state() {
    local i
    for i in `seq 1 $(($2 / 2))`; do
        [ "`nodes_state`" = "$1" ] && return 0
        sleep 2
    done
    return 1
}
log "RedMatic-HomeKit and RedMatic-Matter after a RedMatic update"
[ "`nodes_state`" = "not-installed" ] && ok "neither package installed: recorded for this version, nothing done" || fail "state file after the installs so far: `cat $NODES_STATE 2>&1`"
[ -x $ADDON_DIR/www/nodes_update.cgi ] && ok "www/nodes_update.cgi installed for the settings page" || fail "www/nodes_update.cgi missing or not executable"
for spec in redmatic-homekit@$HOMEKIT_OLD redmatic-matter@$MATTER_OLD; do
    code=`curl -s -o /tmp/install.json -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
        -d "{\"module\":\"${spec%@*}\",\"version\":\"${spec#*@}\"}" $RED/nodes`
    [ "$code" = "200" ] || die "palette install of $spec failed (http $code): `head -c 300 /tmp/install.json`"
done
[ "`module_version redmatic-homekit`|`module_version redmatic-matter`" = "$HOMEKIT_OLD|$MATTER_OLD" ] || die "old versions not installed: `module_version redmatic-homekit` `module_version redmatic-matter`"
ok "installed redmatic-homekit $HOMEKIT_OLD and redmatic-matter $MATTER_OLD through the palette"

# the setting off: an update leaves both alone
set_update_nodes false
echo '{"addon":"0.0.1","state":"current"}' > $NODES_STATE
install_addon
[ $? -eq 0 ] || { cat /tmp/update_script.log; die "update_script exit code (expected 0)"; }
check_running
wait_for_nodes_state disabled 60 && ok "setting off: recorded as not updated" || fail "setting off: state `cat $NODES_STATE`"
sleep 5
[ "`module_version redmatic-homekit`|`module_version redmatic-matter`" = "$HOMEKIT_OLD|$MATTER_OLD" ] && ok "setting off: both packages untouched" \
    || fail "setting off: versions changed to `module_version redmatic-homekit` `module_version redmatic-matter`"

# no stored value (a settings.json from before the setting): on. Both updated in one npm run, one restart.
set_update_nodes unset
echo '{"addon":"0.0.1","state":"current"}' > $NODES_STATE
restarts_before=`grep -c "starting it again" /var/log/messages`
install_addon
[ $? -eq 0 ] || { cat /tmp/update_script.log; die "update_script exit code (expected 0)"; }
check_running
pid_before=`node_red_pid`
if wait_for_nodes_state updated 600; then
    ok "no stored value: updated (`tr -d '\n ' < $NODES_STATE`)"
else
    fail "no stored value: not updated within 600 s: `cat $NODES_STATE`"
fi
[ "`module_version redmatic-homekit`" != "$HOMEKIT_OLD" ] && [ "`module_version redmatic-homekit`" != "missing" ] \
    && ok "redmatic-homekit $HOMEKIT_OLD -> `module_version redmatic-homekit`" || fail "redmatic-homekit is `module_version redmatic-homekit`"
[ "`module_version redmatic-matter`" != "$MATTER_OLD" ] && [ "`module_version redmatic-matter`" != "missing" ] \
    && ok "redmatic-matter $MATTER_OLD -> `module_version redmatic-matter`" || fail "redmatic-matter is `module_version redmatic-matter`"
grep -q '"node-red-contrib-ccu"' $ADDON_DIR/var/package.json || fail "var/package.json lost node-red-contrib-ccu"
sleep 10
wait_for_node_red || die "Node-RED did not come back after the update of the two packages"
[ "`node_red_pid`" != "$pid_before" ] && ok "Node-RED was restarted (pid $pid_before -> `node_red_pid`)" || fail "Node-RED was not restarted"
restarts=$((`grep -c "starting it again" /var/log/messages` - restarts_before))
[ "$restarts" = "1" ] && ok "one restart for both packages" || fail "$restarts restarts for the update of the two packages"
[ "`cat $ADDON_DIR/var/restart_count`" = "0" ] && ok "the restart is not counted as a crash" || fail "restart_count is `cat $ADDON_DIR/var/restart_count`"
[ -e $ADDON_DIR/var/restart_once ] && fail "var/restart_once left behind"
if curl -s -H 'Accept: application/json' $RED/nodes | $ADDON_DIR/bin/node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
        const wanted = {"redmatic-homekit": process.argv[1], "redmatic-matter": process.argv[2]};
        const sets = JSON.parse(s);
        let good = true;
        for (const name of Object.keys(wanted)) {
            const set = sets.find(n => n.module === name);
            console.log(name + " loaded by Node-RED: " + (set ? set.version : "not at all"));
            good = good && Boolean(set) && set.version === wanted[name];
        }
        process.exit(good ? 0 : 1);
    })' "`module_version redmatic-homekit`" "`module_version redmatic-matter`"; then
    ok "Node-RED runs the new versions"
else
    fail "Node-RED does not run the new versions"
fi
# the next start is a normal one: nothing is asked or installed again
stamp=`stat -c %Y $NODES_STATE`
$CONF_DIR/rc.d/redmatic stop
sleep 2
$CONF_DIR/rc.d/redmatic start || die "rc.d/redmatic start"
check_running
sleep 5
[ "`stat -c %Y $NODES_STATE`" = "$stamp" ] && [ "`nodes_state`" = "updated" ] && ok "a normal start leaves it alone" || fail "a normal start ran the update again: `cat $NODES_STATE`"
for module in redmatic-homekit redmatic-matter; do
    code=`curl -s -o /dev/null -w '%{http_code}' -X DELETE $RED/nodes/$module`
    [ "$code" = "204" ] || fail "palette uninstall of $module failed (http $code)"
done

# --- npm cache in RAM (the settings page's switch) ------------------------------
# $1 the value, $2 "chosen" for the settings page's marker (without it: 9.18.0's default)
set_npm_cache() {
    $ADDON_DIR/bin/node -e '
        const fs = require("fs");
        const [file, value, chosen] = process.argv.slice(1);
        const s = JSON.parse(fs.readFileSync(file, "utf8"));
        s.npmCache = value;
        if (chosen) s.npmCacheMigrated = true; else delete s.npmCacheMigrated;
        fs.writeFileSync(file, JSON.stringify(s, null, 2));' $ADDON_DIR/etc/settings.json "$1" "$2"
}
npm_cache_setting() {
    $ADDON_DIR/bin/node -e 'const s = require(process.argv[1]); console.log(s.npmCache + "|" + (s.npmCacheMigrated === true))' $ADDON_DIR/etc/settings.json
}
RAM_CACHE=/tmp/redmatic-npm-cache-`id -u`
log "npm cache in RAM: Node-RED's npm uses /tmp, emptied after each install, the update keeps var/npm-cache"
set_npm_cache ram chosen
$CONF_DIR/rc.d/redmatic stop
sleep 2
$CONF_DIR/rc.d/redmatic start || die "rc.d/redmatic start"
check_running
node_red_env | grep -qx "npm_config_cache=$RAM_CACHE" && ok "RAM: Node-RED's npm caches in /tmp" || fail "RAM: Node-RED's environment has no npm_config_cache=$RAM_CACHE"
before=`ls $ADDON_DIR/var/npm-cache/_cacache/index-v5 2>/dev/null | wc -l`
code=`curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"module":"node-red-node-random"}' $RED/nodes`
[ "$code" = "200" ] || fail "palette install with the cache in RAM failed (http $code)"
[ -d $ADDON_DIR/var/node_modules/node-red-node-random ] || fail "RAM: the module did not land in var/node_modules"
# npm used the RAM cache (its debug log is kept there until the next start) and it was emptied
[ -d $RAM_CACHE/_logs ] && ok "RAM: npm ran with the cache in /tmp (its _logs kept)" || fail "RAM: no $RAM_CACHE/_logs - npm did not use the RAM cache"
[ -d $RAM_CACHE/_cacache ] && fail "RAM: the cache was not emptied after the install: `ls $RAM_CACHE`" || ok "RAM: the cache in /tmp was emptied after the install"
after=`ls $ADDON_DIR/var/npm-cache/_cacache/index-v5 2>/dev/null | wc -l`
[ "$before" = "$after" ] && ok "RAM: the install wrote nothing to var/npm-cache" || fail "RAM: var/npm-cache changed during the install ($before -> $after)"
code=`curl -s -o /dev/null -w '%{http_code}' -X DELETE $RED/nodes/node-red-node-random`
[ "$code" = "204" ] || fail "palette uninstall with the cache in RAM failed (http $code)"
[ -d $RAM_CACHE/_cacache ] && fail "RAM: the cache was not emptied after the removal" || ok "RAM: the cache in /tmp was emptied after the removal"

# --- self-update worker (ROADMAP task 11) -------------------------------------
log "self-update worker: same package from a local http server"
# the container has no /bin/install_addon, so this runs the worker's own
# extract-and-update_script path; --force because the package is not newer
busybox httpd -p 127.0.0.1:8081 -h /dist || die "busybox httpd"
REDMATIC_UPDATE_BASE_URL=http://127.0.0.1:8081 $ADDON_DIR/bin/redmatic-update --force $VERSION_ADDON
rc=$?
echo "--- update.log"; cat /tmp/redmatic-update/update.log
echo "--- state.json"; cat /tmp/redmatic-update/state.json
[ $rc -eq 0 ] || die "redmatic-update exit code $rc"
grep -q '"phase":"done"' /tmp/redmatic-update/state.json || die "worker did not reach phase done"
grep -q '"error":""' /tmp/redmatic-update/state.json || die "worker reported an error"
[ -f /usr/local/tmp/new_addon.tar.gz ] && fail "new_addon.tar.gz left behind"
ls -d /usr/local/tmp/tmp.* >/dev/null 2>&1 && fail "installer temp dir left behind"
ok "worker finished: download, checksum, install, restart"
check_running
node_red_env | grep -q '^npm_config_logs_max=' && fail "npm_config_logs_max set outside openccu-lite" || ok "npm keeps its log default outside openccu-lite"
grep -q '"node-red-contrib-ccu"' $ADDON_DIR/var/package.json || fail "var/package.json lost node-red-contrib-ccu after the self-update"
[ -d $ADDON_DIR/var/npm-cache/_cacache ] && ok "the update kept var/npm-cache" || fail "the update removed var/npm-cache/_cacache"
[ "`npm_cache_setting`" = "ram|true" ] && ok "a chosen RAM cache survives the update" || fail "the update changed a chosen RAM cache: `npm_cache_setting`"
# what a fresh 9.18.0 install has: "ram" from its default, no marker
set_npm_cache ram

# --- self-update worker on openccu-lite (bug 8) ---------------------------------
# When Node-RED is not up after the install, the worker starts it itself. On
# openccu-lite that start must go to addon-redmatic.service as well: rc.d/redmatic
# from the worker would run Node-RED as root outside the unit. update_script
# starts nothing on openccu-lite (bug 16), so the worker's fallback runs.
log "self-update worker on a pretend openccu-lite (the fallback start goes to addon-redmatic.service)"
lite_on
REDMATIC_UPDATE_BASE_URL=http://127.0.0.1:8081 $ADDON_DIR/bin/redmatic-update --force $VERSION_ADDON
rc=$?
echo "--- update.log"; cat /tmp/redmatic-update/update.log
echo "--- systemctl calls"; cat /tmp/systemctl.log
[ $rc -eq 0 ] || die "redmatic-update exit code $rc"
grep -q '"phase":"done"' /tmp/redmatic-update/state.json || die "worker did not reach phase done"
grep -q '^stop addon-redmatic.service$' /tmp/systemctl.log && ok "update_script stopped through the unit" || fail "update_script did not stop addon-redmatic.service"
starts=`grep -c '^start addon-redmatic.service$' /tmp/systemctl.log`
[ "$starts" = 1 ] && ok "the worker's fallback start went to the unit, and it was the only start" ||
    fail "expected 1 start of addon-redmatic.service (the worker's fallback; update_script starts nothing), got $starts"
grep -q "Node-RED is not running after the install, starting addon-redmatic.service" /tmp/redmatic-update/update.log &&
    ok "the worker logged its fallback start" || fail "the worker did not log a fallback start through the unit"
check_running
last_accepted_start | grep -q "systemctl start addon-redmatic.service" &&
    ok "the accepted start came from the unit" || fail "the last accepted start did not come from systemctl: `last_accepted_start`"
[ "`npm_cache_setting`" = "storage|true" ] && ok "9.18.0's default RAM cache went back to the storage" || fail "migration: settings say `npm_cache_setting`, expected storage|true"
node_red_env | grep -q '^npm_config_cache=' && fail "migrated to the storage, but npm_config_cache is set" || ok "migrated: Node-RED's npm keeps etc/npmrc's cache"
[ -d $ADDON_DIR/var/npm-cache/_cacache ] && ok "the update kept var/npm-cache" || fail "the update removed var/npm-cache/_cacache"
lite_off

# --- stop -----------------------------------------------------------------------
log "stop"
$CONF_DIR/rc.d/redmatic stop
sleep 2
if [ -z "`node_red_pid`" ]; then
    ok "Node-RED stopped"
else
    fail "Node-RED still running after stop"
fi

# --- start lock (bug 10) ----------------------------------------------------------
# On a confined openccu-lite the unit starts bin/redmatic as addon-redmatic. While an
# update has left var/ root's, the start lock cannot be created there, and the start
# reported that as "another start holds the lock". It has to name the problem.
log "start lock: a start that cannot create var/start.lock names the permission problem (bug 10)"
MARK=`wc -l < /var/log/messages`
out=`su -s /bin/sh nobody -c "$CONF_DIR/rc.d/redmatic start" 2>&1`
rc=$?
echo "--- output (last 3 lines)"; echo "$out" | tail -3
expected="cannot create $ADDON_DIR/var/start.lock: permission denied (owner root, running as nobody)"
[ $rc -ne 0 ] && ok "the start as nobody exits $rc" || fail "the start as nobody exited 0"
echo "$out" | grep -qF "Node-RED cannot start: $expected" &&
    ok "its output names the permission problem" || fail "its output does not say: Node-RED cannot start: $expected"
new_log=`tail -n +$((MARK + 1)) /var/log/messages`
echo "$new_log" | grep -qF "cant start - $expected" &&
    ok "the syslog names the permission problem" || fail "the syslog does not say: cant start - $expected"
echo "$new_log" | grep -q "another start holds the lock\|removing stale start lock" &&
    fail "the start still took the permission error for a held or stale lock"
[ -z "`node_red_pid`" ] || fail "Node-RED runs after a start that could not take the lock"
[ -d $ADDON_DIR/var/start.lock ] && fail "a start lock was left behind"

dump
echo ""
if [ $FAILED -eq 0 ]; then
    echo "### e2e: PASSED ($VERSION_ADDON)"
    exit 0
fi
echo "### e2e: FAILED ($VERSION_ADDON)"
exit 1

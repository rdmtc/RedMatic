#!/bin/tclsh

source ../lib/querystring.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

# start/stop/restart answer with a status line, then the script's output:
#   ok                      rc.d/redmatic exited 0
#   error: exit <code>      it exited non-zero (error: <reason> when it could not run at all)
# The settings page decides on that line (bug 22). On openccu-lite rc.d/redmatic is the addon-rc
# wrapper: a start, stop or restart from here becomes `systemctl <cmd> addon-redmatic.service` (or
# occulited's addonctl call for a confined addon), which prints nothing - the script's own
# "Starting Node-RED: OK" goes to the journal, so its text cannot tell success from failure.
# Kept to Tcl 8.2 (the CCU's tclsh): the exit status is read off errorCode, not catch's options.
proc rc_status {cmd} {
    global errorCode
    if {[catch {exec /usr/local/etc/config/rc.d/redmatic $cmd} result]} {
        set code [lindex $errorCode 0]
        if {$code == "CHILDSTATUS"} {
            return [list "error: exit [lindex $errorCode 2]" $result]
        } elseif {$code == "CHILDKILLED"} {
            return [list "error: killed by [lindex $errorCode 2]" $result]
        } elseif {$code != "NONE"} {
            return [list "error: $code" $result]
        }
        # NONE: exit 0 with something on stderr, which exec reports as an error
    }
    return [list ok $result]
}

if {[info exists cmd]} {

    if {$cmd == "stop" || $cmd == "start" || $cmd == "restart"} {

        source ../lib/session.tcl

        if {[request_session_ok]} {
            set answer [rc_status $cmd]
            puts [lindex $answer 0]
            if {[lindex $answer 1] != ""} {
                puts [lindex $answer 1]
            }
            exit 0
        } else {
            puts {error: invalid session}
            exit 1
        }
    }

    # No session checks for following commands to reduce costs of periodic calls, exposed information is uncritical imho

    if {$cmd == "ps"} {
        puts [exec ps -o vsz,rss,comm,args | grep "node\\|redmatic"]
        exit 0
    }
    if {$cmd == "cpu"} {
        puts [exec top -b -n 1 | grep "% node-red$" | awk "\{print \$7\}"]
        exit 0
    }
    if {$cmd == "uptime"} {
        puts [exec /usr/local/addons/redmatic/bin/uptime.sh]
        exit 0
    }
}

puts {error: invalid command}
exit 1

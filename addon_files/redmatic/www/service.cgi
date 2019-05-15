#!/bin/tclsh

source ../lib/querystring.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists cmd]} {

    if {$cmd == "stop" || $cmd == "start" || $cmd == "restart"} {

        source ../lib/session.tcl

        if {[info exists sid] && [check_session $sid]} {
            catch {exec /usr/local/etc/config/rc.d/redmatic $cmd} result
            puts $result
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

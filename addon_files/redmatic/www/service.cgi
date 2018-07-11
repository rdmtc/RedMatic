#!/bin/tclsh

source ../lib/querystring.tcl

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

    if {$cmd == "ps"} {

        # No session check to reduce costs of periodic calls, exposed information should be uncritical (it just
        # discloses if Node-RED is running, this info can be obtained easily anyways...)

        puts [exec ps -o vsz,rss,comm,args | grep node]
        exit 0
    }
}

puts {error: invalid command}
exit 1

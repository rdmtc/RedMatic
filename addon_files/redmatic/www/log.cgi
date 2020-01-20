#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists sid] && [check_session $sid]} {

    if {[info exists cmd]} {
        switch -glob $cmd {
            "upgrade" {
                if {[file exists /usr/local/addons/redmatic/var/pkg-upgrade.log]} {
                    catch {exec cat /usr/local/addons/redmatic/var/pkg-upgrade.log} result
                    puts $result
                }
            }
        }
    } else {
        source ../lib/log.tcl
    }
    exit 0
} else {
    puts {error: invalid session}
    exit 1
}

#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

if {[info exists sid] && [check_session $sid]} {
    set fp [open "/usr/local/addons/redmatic/etc/settings.json" r]
    puts "Content-Type: text/json\n"
    puts -nonewline [read $fp]
    close $fp
} else {
    puts "Content-Type: text/plain\n"
    puts {error: invalid session}
}

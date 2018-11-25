#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts "Content-Type: text/plain\n"

if {[info exists sid] && [check_session $sid]} {
    set fp [open "/usr/local/addons/redmatic/etc/settings.json" r]
    puts -nonewline [read $fp]
    close $fp
} else {
    puts {error: invalid session}
}

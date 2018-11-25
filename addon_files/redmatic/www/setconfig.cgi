#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

if {[info exists sid] && [check_session $sid]} {
    set filename "/usr/local/addons/redmatic/etc/settings.json"
    set fp [open $filename "w"]
    puts -nonewline $fp [read stdin]
    close $fp
    puts "Content-Type: text/plain\n"
    puts "ok"
} else {
    puts "Content-Type: text/plain\n"
    puts {error: invalid session}
}

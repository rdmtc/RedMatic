#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists sid] && [check_session $sid]} {
    set fp [open "/usr/local/addons/redmatic/etc/nickname" r]
    puts -nonewline [read $fp]
    close $fp
} else {
    puts {error: invalid session}
}

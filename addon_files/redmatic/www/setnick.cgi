#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists sid] && [check_session $sid]} {
    set filename "/usr/local/addons/redmatic/etc/nickname"
    set fp [open $filename "w"]
    puts -nonewline $fp [read stdin]
    close $fp
    puts "ok"
} else {
    puts {error: invalid session}
}

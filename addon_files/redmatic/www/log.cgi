#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists sid] && [check_session $sid]} {

    source ../lib/log.tcl
    exit 0
} else {
    puts {error: invalid session}
    exit 1
}

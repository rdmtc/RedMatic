#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[request_session_ok]} {
    puts [exec /usr/local/addons/redmatic/bin/redmatic-logupload]
    exit 0
} else {
    puts {error: invalid session}
    exit 1
}

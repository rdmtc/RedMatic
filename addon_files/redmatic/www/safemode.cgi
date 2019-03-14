#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists sid] && [check_session $sid]} {
    catch {exec touch /usr/local/addons/redmatic/var/safe_mode} result
    puts $result
} else {
    puts {error: invalid session}
}

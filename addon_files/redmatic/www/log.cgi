#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts "Content-Type: text/plain\r\n"

if {[info exists sid] && [check_session $sid]} {

    catch {exec /usr/local/addons/redmatic/bin/redmaticVersions} result
    puts $result
    catch {exec cat /var/log/messages.0 /var/log/messages | grep node-red\\|redmatic} result
    puts $result
    exit 0
} else {
    puts {error: invalid session}
    exit 1
}

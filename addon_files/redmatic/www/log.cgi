#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

if {[info exists sid] && [check_session $sid]} {

    catch {exec /usr/local/addons/redmatic/bin/redmaticVersions} result
    puts $result
    puts ""
     if {[file exists /usr/local/addons/redmatic/var/pkg-update.log]} {
       catch {exec cat /usr/local/addons/redmatic/var/pkg-update.log} result
        puts $result
        puts ""
    }
    if {[file exists /var/log/messages.0]} {
        catch {exec cat /var/log/messages.0 | grep node-red\\|redmatic } result
        puts $result
    }
    catch {exec cat /var/log/messages | grep node-red\\|redmatic} result
    puts $result
    exit 0
} else {
    puts {error: invalid session}
    exit 1
}

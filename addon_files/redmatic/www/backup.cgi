#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

if {[request_session_ok]} {


    set HOSTNAME [exec hostname]
    set iso8601_date [exec date -Iseconds]

    regexp {^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)([+-]\d+)$} $iso8601_date dummy year month day hour minute second zone
    set backupfile [set HOSTNAME]-RedMatic-$year-$month-$day-$hour$minute.tar.gz

    cd /usr/local/addons/redmatic
    catch { exec tar --owner=root --group=root --exclude=bin --exclude=include --exclude=lib --exclude=libexec --exclude=npm-cache --exclude=share --exclude=node_modules --exclude=www --ignore-failed-read -czf /usr/local/tmp/redmatic.tar.gz .}

    cd /

    #   lighttpd delivers the file itself (X-Sendfile). openccu-lite runs the
    #   addon CGIs in occulited (not in lighttpd's mod_cgi) and knows no
    #   X-Sendfile, so there the archive is written to stdout.
    if {[info exists env(SERVER_SOFTWARE)] && [string match -nocase "*occulited*" $env(SERVER_SOFTWARE)]} {
        puts "Content-Type: application/octet-stream"
        puts "Content-Disposition: attachment; filename=\"$backupfile\"\n"
        flush stdout
        if {![catch {set fp [open /usr/local/tmp/redmatic.tar.gz r]}]} {
            fconfigure $fp -translation binary
            fconfigure stdout -translation binary
            fcopy $fp stdout
            close $fp
        }
    } else {
        puts "X-Sendfile: /usr/local/tmp/redmatic.tar.gz"
        puts "Content-Type: application/octet-stream"
        puts "Content-Disposition: attachment; filename=\"$backupfile\"\n"
    }


} else {
    puts "Content-Type: text/plain\n"
    puts {error: invalid session}
}


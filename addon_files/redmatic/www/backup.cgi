#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

if {[info exists sid] && [check_session $sid]} {


    set HOSTNAME [exec hostname]
    set iso8601_date [exec date -Iseconds]

    regexp {^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)([+-]\d+)$} $iso8601_date dummy year month day hour minute second zone
    set backupfile [set HOSTNAME]-RedMatic-$year-$month-$day-$hour$minute.tar.gz

    cd /usr/local/addons/redmatic
    catch { exec tar --owner=root --group=root --exclude=bin --exclude=include --exclude=lib --exclude=libexec --exclude=npm-cache --exclude=share --exclude=node_modules --exclude=www --ignore-failed-read -czf /usr/local/tmp/redmatic.tar.gz .}

    cd /

    puts "X-Sendfile: /usr/local/tmp/redmatic.tar.gz"
    puts "Content-Type: application/octet-stream"
    puts "Content-Disposition: attachment; filename=\"$backupfile\"\n"


} else {
    puts "Content-Type: text/plain\n"
    puts {error: invalid session}
}


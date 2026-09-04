#!/bin/tclsh
#
#   Self-update backend for the settings page (ROADMAP task 11).
#
#     ?cmd=start&sid=@...@[&force=1]   start bin/redmatic-update detached
#     ?cmd=status                      current state (JSON, written by the worker)
#     ?cmd=log&sid=@...@               the worker's log (text)
#     ?cmd=reset&sid=@...@             forget a finished run
#
#   status needs no session, like service.cgi?cmd=ps: the page polls it every
#   second for minutes and it exposes nothing but phase and version numbers.
#   Everything else triggers or reads privileged things and needs the CCU
#   session.

source ../lib/querystring.tcl

set STATE_DIR /tmp/redmatic-update
set STATE $STATE_DIR/state.json
set WORKER /usr/local/addons/redmatic/bin/redmatic-update

proc read_file {name} {
    if {[catch {set fp [open $name r]}]} {
        return ""
    }
    set data [read $fp]
    close $fp
    return $data
}

proc read_state {} {
    global STATE
    set data [string trim [read_file $STATE]]
    if {$data == ""} {
        return {{"phase":"idle"}}
    }
    return $data
}

proc running {} {
    global STATE_DIR
    set pid [string trim [read_file $STATE_DIR/pid]]
    if {$pid == "" || ![string is integer $pid]} {
        return 0
    }
    return [file exists /proc/$pid]
}

if {![info exists cmd]} {
    set cmd status
}

if {$cmd == "status"} {
    puts -nonewline "Content-Type: application/json; charset=utf-8\r\n\r\n"
    puts [read_state]
    exit 0
}

source ../lib/session.tcl

if {![info exists sid] || ![check_session $sid]} {
    puts -nonewline "Content-Type: application/json; charset=utf-8\r\n\r\n"
    puts {{"error":"invalid session"}}
    exit 0
}

if {$cmd == "log"} {
    puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
    puts -nonewline [read_file $STATE_DIR/update.log]
    exit 0
}

puts -nonewline "Content-Type: application/json; charset=utf-8\r\n\r\n"

if {$cmd == "start"} {
    if {[running]} {
        puts [read_state]
        exit 0
    }
    file mkdir $STATE_DIR
    # a fresh state right away, so the page does not read the previous run
    set fp [open $STATE w]
    puts $fp {{"phase":"starting","message":"Update wird gestartet ...","percent":0,"ts":0}}
    close $fp
    set args ""
    if {[info exists force] && $force == "1"} {
        set args "--force"
    }
    # detached from the CGI: own session, no inherited stdio, or lighttpd
    # would wait for the worker to finish
    exec /usr/bin/setsid /bin/sh -c "$WORKER $args >/dev/null 2>&1 </dev/null" &
    puts {{"phase":"starting","message":"Update wird gestartet ...","percent":0}}
} elseif {$cmd == "reset"} {
    if {![running]} {
        file delete -force $STATE
    }
    puts {{"phase":"idle"}}
} else {
    puts {{"error":"unknown command"}}
}

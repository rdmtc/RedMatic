#!/bin/tclsh

load tclrega.so

proc check_session sid {
    if {[regexp {@([0-9a-zA-Z]{10})@} $sid all sidnr]} {
        set res [lindex [rega_script "Write(system.GetSessionVarStr('$sidnr'));"] 1]
        if {$res != ""} {
            return 1
        }
    }
    return 0
}

#   The session header of openccu-lite (B-94, D-65). lighttpd's gate hands every
#   request it lets through under /addons/ the bare id of the session it accepted,
#   from the cookie or from ?sid=, as X-Occulite-Session - HTTP_X_OCCULITE_SESSION
#   for a CGI - and removes any copy a client sent. With the header the settings
#   page no longer needs ?sid=@...@ in its address.
#
#   The header is no proof by itself: a CCU passes a client's header straight
#   through, and so does an openccu-lite image from before it. So it is read on
#   openccu-lite only, and the box is asked about it the way lib/ccu-auth.js does:
#   GET /api/auth/v1/state with the id as Bearer has to answer that very session.
#   An API token (/state names no sid for it) is refused. Where the header is
#   there it decides; ?sid=@...@ and the ReGa check above stay for a CCU, OpenCCU
#   and openccu-lite images without the header.
#
#   Nothing below reads a global variable: lib/querystring.tcl sets one for every
#   query parameter.

#   The markers lib/ccu-auth.js and update_script use: a LITE= line in /VERSION,
#   or occulited. A CCU3 and OpenCCU have neither.
proc is_openccu_lite {{versionFile /VERSION} {occulited /usr/bin/occulited}} {
    if {![catch {open $versionFile r} fp]} {
        set version [read $fp]
        close $fp
        if {[regexp -line {^LITE=} $version]} {
            return 1
        }
    }
    return [file exists $occulited]
}

#   The id in this request's session header, "" when there is none to use.
proc session_header {} {
    global env
    if {![info exists env(HTTP_X_OCCULITE_SESSION)] || ![is_openccu_lite]} {
        return ""
    }
    return $env(HTTP_X_OCCULITE_SESSION)
}

proc occulite_state_url {} {
    return http://127.0.0.1/api/auth/v1/state
}

#   The box's answer about one session id, "" when it cannot be asked.
proc occulite_state id {
    if {[catch {package require http}]} {
        return ""
    }
    if {[catch {http::geturl [occulite_state_url] -headers [list Authorization "Bearer $id"] -timeout 5000} token]} {
        return ""
    }
    set body ""
    if {[http::status $token] == "ok" && [http::ncode $token] == 200} {
        set body [http::data $token]
    }
    http::cleanup $token
    return $body
}

#   1 when the box confirms `id` as one of its live sessions. A value that is not
#   a bare session id (a list of several, a line break, @-wrapped) is refused
#   without asking.
proc check_occulite_session id {
    if {![regexp {^[A-Za-z0-9]{1,64}$} $id]} {
        return 0
    }
    set state [occulite_state $id]
    #   JSON escapes every quote inside a string, so a user name cannot fake a key
    if {![regexp {"authenticated"\s*:\s*true} $state]} {
        return 0
    }
    if {![regexp {"sid"\s*:\s*"([A-Za-z0-9]+)"} $state all stateSid] || $stateSid != $id} {
        return 0
    }
    return 1
}

#   1 when this request comes with a live session: the session header where
#   openccu-lite sends one, otherwise ?sid=@...@ as always.
proc request_session_ok {} {
    set id [session_header]
    if {$id != ""} {
        return [check_occulite_session $id]
    }
    upvar #0 sid sid
    if {[info exists sid]} {
        return [check_session $sid]
    }
    return 0
}

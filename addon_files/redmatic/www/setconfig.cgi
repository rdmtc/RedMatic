#!/bin/tclsh

load tclrega.so

catch {
  set input $env(QUERY_STRING)
  set pairs [split $input &]
  foreach pair $pairs {
    if {0 != [regexp "^(\[^=]*)=(.*)$" $pair dummy varname val]} {
      set $varname $val
    }
  }
}

if {[info exists sid] > 0} {
    # Session prüfen
    if {
        ([string index $sid 0] != "@")
        || ([string index $sid [expr [string length $sid] -1]]  != "@")
        || ([string length $sid] != 12)} {
        puts {error: session invalid}
    } else {
        regsub -all {@} $sid "" sid
        set res [lindex [rega_script "Write(system.GetSessionVarStr('$sid'));"] 1]
        if {$res != ""} {
            # gültige Session
            set filename "/usr/local/addons/redmatic/etc/settings.json"
            set fp [open $filename "w"]
            puts -nonewline $fp [read stdin]
            close $fp
            puts "ok"

        } else {
            puts {error: session invalid}
        }
    }
} else {
    puts {error: no session}
}

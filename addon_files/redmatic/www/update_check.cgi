#!/usr/bin/env tclsh

set checkURL    "https://api.github.com/repos/rdmtc/RedMatic/releases/latest"
set downloadURL "https://github.com/rdmtc/RedMatic/releases/latest"

catch {
  set input $env(QUERY_STRING)
  set pairs [split $input &]
  foreach pair $pairs {
    if {0 != [regexp "^(\[^=]*)=(.*)$" $pair dummy varname val]} {
      set $varname $val
    }
  }
}


if { [info exists cmd ] && $cmd == "download"} {
  puts -nonewline "Content-Type: text/html; charset=utf-8\r\n\r\n"
  puts "<html><head><meta http-equiv='refresh' content='0; url=$downloadURL' /></head></html>"
} elseif { [info exists cmd ] && $cmd == "versions" } {
  puts -nonewline "Content-Type: application/json; charset=utf-8\r\n\r\n"
  puts [ exec /usr/local/addons/redmatic/bin/redmaticVersions ]
} else {
  puts -nonewline "Content-Type: text/html; charset=utf-8\r\n\r\n"
  catch {
    [regexp "tag_name\": \"v(\[0-9\]+\.\[0-9\]+\.\[0-9\]+(-\[a-zA-Z\]+.\[0-9\]+)?)" [ exec /usr/bin/env wget -qO- --no-check-certificate $checkURL ] dummy newversion]
  }
  if { [info exists newversion] } {
    puts -nonewline $newversion
  } else {
    puts -nonewline "n/a"
  }
}
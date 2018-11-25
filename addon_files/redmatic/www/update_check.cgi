#!/usr/bin/env tclsh

set checkURL    "https://api.github.com/repos/HM-RedMatic/RedMatic/releases/latest"
set downloadURL "https://github.com/HM-RedMatic/RedMatic/releases/latest"

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
  puts "<html><head><meta http-equiv='refresh' content='0; url=$downloadURL' /></head></html>"
} else {
  catch {
    [regexp "tag_name\": \"v(\[0-9\]+\.\[0-9\]+\.\[0-9\]+(-\[a-zA-Z\]+.\[0-9\]+)?)" [ exec /usr/bin/env wget -qO- --no-check-certificate $checkURL ] dummy newversion]
  }
  if { [info exists newversion] } {
    puts -nonewline $newversion
  } else {
    puts -nonewline "n/a"
  }
}
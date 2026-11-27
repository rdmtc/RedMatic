#!/bin/tclsh
#
#   What the last update of RedMatic-HomeKit and RedMatic-Matter after a RedMatic update did
#   (lib/update-redmatic-nodes.js): its state file as JSON, {} when there is none yet. For the
#   settings page.
#
#   No session, like service.cgi?cmd=ps and update.cgi?cmd=status: the page asks while a run is
#   going on, and the answer holds the versions of two packages and npm's error text, nothing else.
#
#   A CGI and not a link in www/ to the file: openccu-lite serves no file that leaves www/.

puts -nonewline "Content-Type: application/json; charset=utf-8\r\n\r\n"

set data ""
catch {
    set fp [open /usr/local/addons/redmatic/var/redmatic-nodes-update.json r]
    set data [string trim [read $fp]]
    close $fp
}
if {$data == ""} {
    set data "{}"
}
puts $data

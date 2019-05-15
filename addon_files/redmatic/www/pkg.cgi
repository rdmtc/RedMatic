#!/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl


if {[info exists sid] && [check_session $sid]} {
    if {[info exists cmd]} {
        switch -glob $cmd {
            "repo" {
                puts -nonewline "Content-Type: text/json; charset=utf-8\r\n\r\n"
                puts [exec cat /usr/local/addons/redmatic/lib/pkg-repo.json]
            }
            "ls" {
                puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
                foreach pkgjson [glob /usr/local/addons/redmatic/lib/node_modules/*/package.json] {
                    puts "[lrange [file split $pkgjson] end-1 end-1] [exec /usr/local/addons/redmatic/bin/jq -r ".version" $pkgjson]"
                }
            }
            "install" {
                puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
                if {[info exists package]} {
                    puts [exec /usr/local/addons/redmatic/bin/redmatic-pkg install $package]
                } else {
                    puts "param package missing"
                }
            }
            "remove" {
                puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
                if {[info exists package]} {
                    puts [exec /usr/local/addons/redmatic/bin/redmatic-pkg remove $package]
                } else {
                    puts "param package missing"
                }
            }
            default {
                puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
                puts "unknown command $cmd"
            }
        }
    } else {
        puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
        puts "param cmd missing"
    }

} else {
    puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
    puts "error: invalid session"
}

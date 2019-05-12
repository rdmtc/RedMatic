{
  "targets": [{
    "target_name": "i2c",
    "include_dirs" : [
      "<!(node -e \"require('nan')\")"
    ],
    "conditions": [[
      'OS == "linux"', {
        "sources": [
         "./src/i2c.cc"
        ],
        "conditions": [[
          '"<!(echo $V)" != "1"', {
            "cflags": [
              "-Wno-deprecated-declarations",
              "-Wno-cast-function-type"
            ]
          }]
        ]
      }]
    ]
  }]
}


# Build Process

Dependencies are defined in

* `addon_files/redmatic/lib/package.json` (Node-RED, npm, Modules with binary dependencies)
* `addon_files/redmatic/var/package.json` (additional Node-RED nodes)
* `addon_files/redmatic/www/package.json` (Modules used by config UI, jQuery, Bootstrap, Bcrypt.js)

The Node.js version that is bundled with the addon is defined in `./package.json` under 
`"engines":{"node":"<version>"}}`.


## Binary Modules

The binary modules that are needed before the build is started are created by the script `prebuild.sh`, I'm doing this
locally, afterwards the binaries are added to git repo. This is something I'm not happy with, but the
effort of creating the binaries on Travis (via QEMU) is quite high and Travis limits a job run to 45 minutes which is
not enough - especially when using QEMU... Cross-compilation is also not really practically, node-gyp doesn't give you
full control of the build...


## Pipeline

The Travis Job sets a tag, creates a release, runs `build.sh`, uploads the files in the `dist` folder and calls
`update_release_body.sh` afterwards. This Job is triggered manually.

`build.sh` creates the CCU addons and the package files and puts them in the `dist` folder. It also creates
`RELEASE_BODY.md` and updates the `CHANGE_HISTORY` in the Github Wiki.


## Update Dependencies

`update.sh` updates all dependencies defined in the 3 package.json files mentioned before to the latest version and 
calls `update_package.js` which combines them in `./package.json` (needed to have one place to check all dependencies 
for updates/issues by david-dm/libraries.io). Furthermore it calls `update_readme.js` that merges 
`docs/README.header.md`, `wiki/Intro.md`, `wiki/Home.md` and `docs/README.footer.md` into the `README.md` file.


## Update 3rd Party Licenses

`update_licenses.js` creates the `LICENSES.md` and `addon_files/redmatic/www/licenses.html` files. This needs all
dependencies already installed in `addon_tmp`, so you have to do a local build before running this script.

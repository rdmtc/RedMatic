# Build Process

Dependencies are defined in

* `addon_files/redmatic/lib/package.json` (Node-RED, npm)
* `addon_files/redmatic/var/package.json` (Node-RED nodes: node-red-contrib-ccu)
* `addon_files/redmatic/www/package.json` (Modules used by config UI, jQuery, Bootstrap, Bcrypt.js)

The Node.js version that is bundled with the addon is defined in `./package.json` under
`"engines":{"node":"<version>"}}`.

The addon contains no native node modules, so no prebuilds and no
cross-compilation are needed. The only per-architecture binaries are the
Node.js runtime (downloaded at build time) and the small `update_addon` CCU
tool checked in under `tools/<arch>/`.


## Pipeline

`build.sh` creates the CCU addon packages (one per architecture: armv7l,
aarch64, x86_64) and puts them in the `dist` folder. It also creates
`RELEASE_BODY.md` and updates the `CHANGE_HISTORY` in the Github Wiki.

Releases are built by the GitHub Actions workflow
(`.github/workflows/build.yml`).


## Update Dependencies

`update.sh` updates all dependencies defined in the 3 package.json files mentioned before to the latest version and
calls `update_package.js` which combines them in `./package.json` (needed to have one place to check all dependencies
for updates/issues). Furthermore it calls `update_readme.js` that merges
`docs/README.header.md`, `wiki/Intro.md`, `wiki/Home.md` and `docs/README.footer.md` into the `README.md` file.


## Update 3rd Party Licenses

`update_licenses.js` creates the `LICENSES.md` and `addon_files/redmatic/www/licenses.html` files. This needs all
dependencies already installed in `addon_tmp`, so you have to do a local build before running this script.

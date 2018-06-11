Dependencies are defined in

* `addon_files/redmatic/lib/package.json` (Node-RED, npm)
* `addon_files/redmatic/var/package.json` (additional Node-RED nodes)
* `addon_files/redmatic/www/package.json` (Modules used by config UI, jQuery, Bootstrap, Bcrypt.js)

`update_deps.sh` updates all dependencies defined in these 3 files to the latest version and calls `combine_package.js`
which combines them in `./package.json` (needed for [david-dm](https://david-dm.org/hobbyquaker/redmatic) to check all 
dependencies for updates/issues).

The Node.js version that is bundled with the addon is defined in `./package.json`.

`build.sh` creates the CCU addon package file and puts it in the `dist` folder. Beside that it also creates the
`CHANGELOG.md`.

The Travis Job runs `build.sh` and publishes the Artifact on the Github Release Page, accompanied by the `CHANGELOG.md`.
 
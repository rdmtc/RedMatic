Dependencies are defined in

* `addon_files/redmatic/lib/package.json` (Node-RED, npm)
* `addon_files/redmatic/var/package.json` (additional Node-RED nodes)
* `addon_files/redmatic/www/package.json` (Modules used by config UI, jQuery, Bootstrap, Bcrypt.js)

`update_deps.sh` updates all dependencies to the latest version and combines them in `package.json` (needed for 
[david-dm](https://david-dm.org/hobbyquaker/redmatic) to check all dependencies for updates/issues).

The Node.js version is defined in `./package.json`.

`build.sh` creates the CCU addon package file and puts it in the `dist` folder. Beside that it also creates
`CHANGELOG.md`,

The Travis Job runs `build.sh` and publishes the Artifact on the Github Release Page, accompanied by the `CHANGELOG.md`.
 
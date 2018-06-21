Dependencies are defined in

* `addon_files/redmatic/lib/package.json` (Node-RED, npm)
* `addon_files/redmatic/var/package.json` (additional Node-RED nodes)
* `addon_files/redmatic/www/package.json` (Modules used by config UI, jQuery, Bootstrap, Bcrypt.js)

`update.sh` updates all dependencies defined in these 3 files to the latest version and calls `update_package.js`
which combines them in `./package.json` (needed for [david-dm](https://david-dm.org/hobbyquaker/redmatic) to check all 
dependencies for updates/issues). Furthermore it calls update_readme.js which inserts the wiki TOC into the README file.

The Node.js version that is bundled with the addon is defined in `./package.json` under 
`"engines":{"node":"<version>"}}`.

`build.sh` creates the CCU addon package file and puts it in the `dist` folder. It also creates the `CHANGELOG.md`.
 
`update_licenses.js` creates the `LICENSES.md` and `addon_files/redmatic/www/licenses.html` files. This needs all
dependencies already installed in `addon_tmp`.

The Travis Job runs `build.sh` and calls `github_release.rb` which publishes the Artifact on the Github Release Page, 
accompanied by the `CHANGELOG.md`.
 
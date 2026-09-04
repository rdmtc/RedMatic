#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`
ADDON_TMP=$BUILD_DIR/addon_tmp

VERSION_ADDON=`node -p "require('$BUILD_DIR/package.json').version"`
NODE_VERSION=`node -p "require('$BUILD_DIR/package.json').engines.node"`

MODIFIED=`git diff-index --quiet HEAD || echo "(modified)"`
echo "git diff $MODIFIED"

echo "creating RELEASE_BODY.md"

DOWNLOAD="https://github.com/rdmtc/RedMatic/releases/download/v$VERSION_ADDON/redmatic-$VERSION_ADDON.tar.gz"
DOWNLOAD_X86_64="https://github.com/rdmtc/RedMatic/releases/download/v$VERSION_ADDON/redmatic-x86_64-$VERSION_ADDON.tar.gz"
DOWNLOAD_AARCH64="https://github.com/rdmtc/RedMatic/releases/download/v$VERSION_ADDON/redmatic-aarch64-$VERSION_ADDON.tar.gz"

cat >RELEASE_BODY.md <<EOL
### Downloads

#### CCU3 (Firmware ab 3.61.5), piVCCU3 und OpenCCU Varianten _rpi2_, _tinkerboard_ und _oci_arm_ (armv7l)
  [![Downloads redmatic-$VERSION_ADDON](https://img.shields.io/github/downloads/rdmtc/RedMatic/v$VERSION_ADDON/redmatic-$VERSION_ADDON.tar.gz.svg)]($DOWNLOAD)
EOL

if [ -f $BUILD_DIR/dist/redmatic-aarch64-$VERSION_ADDON.tar.gz ]; then
cat >>RELEASE_BODY.md <<EOL
#### OpenCCU Varianten _rpi3_, _rpi4_, _rpi5_ und _oci_arm64_ (aarch64)
  [![Downloads redmatic-aarch64-$VERSION_ADDON](https://img.shields.io/github/downloads/rdmtc/RedMatic/v$VERSION_ADDON/redmatic-aarch64-$VERSION_ADDON.tar.gz.svg)]($DOWNLOAD_AARCH64)
EOL
fi

if [ -f $BUILD_DIR/dist/redmatic-x86_64-$VERSION_ADDON.tar.gz ]; then
cat >>RELEASE_BODY.md <<EOL
#### OpenCCU Varianten _ova_, _intelnuc_ und _oci_amd64_ (x86_64)
  [![Downloads redmatic-x86_64-$VERSION_ADDON](https://img.shields.io/github/downloads/rdmtc/RedMatic/v$VERSION_ADDON/redmatic-x86_64-$VERSION_ADDON.tar.gz.svg)]($DOWNLOAD_X86_64)
EOL
fi

# automatic releases: what triggered this one (written by update_versions.js --apply)
if [ -f $BUILD_DIR/RELEASE_SUMMARY.md ]; then
    echo "" >>RELEASE_BODY.md
    cat $BUILD_DIR/RELEASE_SUMMARY.md >>RELEASE_BODY.md
fi

# hand-written notes for the release (breaking changes, requirements)
if [ -f $BUILD_DIR/docs/RELEASE_NOTES.md ]; then
    echo "" >>RELEASE_BODY.md
    cat $BUILD_DIR/docs/RELEASE_NOTES.md >>RELEASE_BODY.md
fi

cat >>RELEASE_BODY.md <<EOL


### Changes

EOL

git log `git describe --tags --abbrev=0`..HEAD --pretty=format:'* %h @%an %s' \
    | grep -v "Merge remote-tracking branch" \
    | grep -vi "update readme" \
    | grep -vi "bump version" \
    | sed -e 's/Sebastian Raff/hobbyquaker/g' \
    >>RELEASE_BODY.md

cat >>RELEASE_BODY.md <<EOL


**[Change History](https://github.com/rdmtc/RedMatic/wiki/CHANGE_HISTORY)**


### Module Versions

Module | Version
------ | -------
[Node.js](https://nodejs.org/) | $NODE_VERSION
EOL

node -e '
const fs = require("fs");
const path = require("path");
function scan(dir) {
    let entries = [];
    try { entries = fs.readdirSync(dir); } catch { return; }
    for (const name of entries) {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(dir, name, "package.json"), "utf8"));
            if (pkg.name && pkg.version) {
                console.log(pkg.homepage ? `[${pkg.name}](${pkg.homepage}) | ${pkg.version}` : `${pkg.name} | ${pkg.version}`);
            }
        } catch {}
        if (name.startsWith("@")) scan(path.join(dir, name));
    }
}
for (const dir of process.argv.slice(1)) scan(dir);
' $ADDON_TMP/redmatic/lib/node_modules $ADDON_TMP/redmatic/var/node_modules >> RELEASE_BODY.md

cat >>RELEASE_BODY.md <<EOL


### Build
EOL

if [ $GITHUB_RUN_ID ]; then
    echo -e "[Github Action $GITHUB_WORKFLOW #$GITHUB_RUN_NUMBER](https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID)" >> RELEASE_BODY.md
else
    echo -e "\n\nCustom build `git rev-parse --abbrev-ref HEAD` `git rev-parse HEAD` $MODIFIED `date '+%Y-%m-%d %H:%M:%S'`" >> RELEASE_BODY.md
fi

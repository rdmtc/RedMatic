#!/bin/bash

curl --silent -L https://api.github.com/repos/rdmtc/RedMatic/releases/latest > latest-release.json

LTAG=`jq -r '.tag_name' latest-release.json`

source addon_tmp/redmatic/versions

if [ "$LTAG" != "v$VERSION_ADDON" ]; then
    echo "wrong release"
    rm latest-release.json
    exit 1
fi

RELEASE=`jq -r '.id' latest-release.json`
rm latest-release.json

echo "console.log(JSON.stringify({body: require('fs').readFileSync('./RELEASE_BODY.md').toString()}))" | node | curl -H "Authorization: token $GITHUB_OAUTH_TOKEN" -X PATCH --silent -L --data @- https://api.github.com/repos/rdmtc/RedMatic/releases/$RELEASE > /dev/null

exit $?

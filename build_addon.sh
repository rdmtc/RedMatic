#!/bin/bash
#
# Builds the RedMatic addon package for one architecture:
#
#   ./build_addon.sh <armv7l|aarch64|x86_64>
#
# Where the Node.js runtime comes from, per architecture:
#
#   armv7l   CCU3 hardware. The official eQ-3 firmware is glibc 2.27, while every
#            nodejs.org binary since Node 18 needs GLIBC_2.28 - and nodejs.org
#            stopped building armv7l after v23 entirely. Alpine still builds
#            current Node for armv7 against musl, so we take that binary together
#            with the musl loader and its shared libraries, and rewrite its ELF
#            interpreter and RPATH to point inside the addon. The CCU's own libc
#            is then irrelevant: the runtime is self-contained.
#   aarch64  OpenCCU (formerly RaspberryMatic) 64-bit, glibc is current -> stock nodejs.org tarball.
#   x86_64   OpenCCU/debmatic on x86, glibc is current -> stock nodejs.org tarball.
#
# git (needed by the Node-RED projects feature and for npm installs from git
# URLs) is assembled the same way from Alpine's musl build on all three
# architectures - the CCU firmware ships no git.
#
# Requires: curl, tar, node, npm and patchelf.

set -o pipefail

ARCH=${1:-armv7l}

BUILD_DIR=`cd ${0%/*} && pwd -P`

VERSION_ADDON=`node -p "require('$BUILD_DIR/package.json').version"`
NODE_VERSION=`node -p "require('$BUILD_DIR/package.json').engines.node"`
NODE_MAJOR=${NODE_VERSION%%.*}

PREFIX=/usr/local/addons/redmatic
ALPINE_BRANCH=${ALPINE_BRANCH:-edge}
ALPINE_MIRROR=${ALPINE_MIRROR:-https://dl-cdn.alpinelinux.org/alpine}

echo ""
echo "Build RedMatic v$VERSION_ADDON ($ARCH)"
echo ""

case $ARCH in
  armv7l)  ALPINE_ARCH=armv7 ;;
  aarch64) ALPINE_ARCH=aarch64 ;;
  x86_64)  ALPINE_ARCH=x86_64 ;;
  *)
    echo "usage: $0 <armv7l|aarch64|x86_64>" >&2
    exit 1
    ;;
esac

command -v patchelf >/dev/null 2>&1 || { echo "error: patchelf is required" >&2; exit 1; }

ADDON_FILES=$BUILD_DIR/addon_files
ADDON_TMP=$BUILD_DIR/addon_tmp
ADDON=$ADDON_TMP/redmatic
VERSION_FILE=$ADDON/versions

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*

echo "node version on build system: `node --version`"

# --- helpers for assembling self-contained musl binaries from Alpine packages ---

# resolve an Alpine package closure and unpack it into a staging root
alpine_fetch() {
    local pkg="$1" root="$2" packages url
    packages=`node $BUILD_DIR/alpine-packages.mjs $pkg $ALPINE_ARCH $ALPINE_BRANCH $ALPINE_MIRROR` || return 1
    rm -rf "$root"
    mkdir -p "$root"
    for url in $packages; do
        echo "download and extract `basename $url` ..."
        curl -fsSL --max-time 300 "$url" | tar -xzf - -C "$root" 2>/dev/null
    done
}

# copy one shared library (following symlinks) from $SRCROOT into $ADDON/lib
copy_lib() {
    local name="$1" dir real base
    [ -e "$ADDON/lib/$name" ] && return 0
    for dir in "$SRCROOT/lib" "$SRCROOT/usr/lib"; do
        [ -e "$dir/$name" ] || continue
        real=`readlink -f "$dir/$name"`
        base=`basename "$real"`
        cp -a "$real" "$ADDON/lib/$base"
        [ "$base" == "$name" ] || ln -sfn "$base" "$ADDON/lib/$name"
        return 0
    done
    echo "error: shared library $name not found in the staging root" >&2
    return 1
}

# copy the transitive DT_NEEDED closure of the given ELF files into $ADDON/lib
copy_closure() {
    local queue="$*" current needed
    while [ -n "$queue" ]; do
        current=${queue%% *}
        queue=${queue#"$current"}
        queue=${queue# }
        for needed in `patchelf --print-needed "$current" 2>/dev/null`; do
            if [ ! -e "$ADDON/lib/$needed" ]; then
                copy_lib "$needed" || return 1
                queue="$queue `readlink -f $ADDON/lib/$needed`"
            fi
        done
    done
}

ICU_VERSION=""

if [ "$ARCH" == "armv7l" ]; then
    mkdir -p $ADDON/bin $ADDON/lib

    # Resolve nodejs and everything it needs from the Alpine package index,
    # then download and unpack the .apk files (concatenated gzipped tars).
    PACKAGES=`node $BUILD_DIR/alpine-packages.mjs nodejs $ALPINE_ARCH $ALPINE_BRANCH $ALPINE_MIRROR` || exit 1
    APK_VERSION=`echo "$PACKAGES" | sed -n 's|.*/nodejs-\(.*\)\.apk$|\1|p' | head -1`
    NODE_VERSION_ARMV7L=${APK_VERSION%%-r*}
    case $NODE_VERSION_ARMV7L in
        $NODE_MAJOR.*) ;;
        *)
            echo "error: alpine/$ALPINE_BRANCH/$ALPINE_ARCH ships nodejs $NODE_VERSION_ARMV7L, expected ${NODE_MAJOR}.x." >&2
            echo "       Pick another ALPINE_BRANCH or move engines.node in package.json." >&2
            exit 1
            ;;
    esac
    echo "alpine/$ALPINE_BRANCH/$ALPINE_ARCH: nodejs $APK_VERSION"
    NODE_VERSION=$NODE_VERSION_ARMV7L

    SRCROOT=$ADDON_TMP/alpine-root
    alpine_fetch nodejs $SRCROOT || exit 1

    [ -f $SRCROOT/usr/bin/node ] || { echo "error: the nodejs package did not contain usr/bin/node" >&2; exit 1; }
    cp -a $SRCROOT/usr/bin/node $ADDON/bin/node

    copy_closure $ADDON/bin/node || exit 1

    # ICU data. Alpine builds node against the system ICU, whose data lives in
    # a .dat file under a path compiled into the library (/usr/share/icu/<ver>).
    # That path does not exist on a CCU, so the data ships inside the addon and
    # the runtime scripts export ICU_DATA (via the versions file); without it
    # node does not start.
    if [ -d $SRCROOT/usr/share/icu ]; then
        mkdir -p $ADDON/share
        cp -a $SRCROOT/usr/share/icu $ADDON/share/
        ICU_VERSION=`ls $ADDON/share/icu | head -1`
    else
        echo "error: no ICU data in the staging root - node would not start" >&2
        exit 1
    fi

    # the ELF interpreter itself (musl's loader), which is not a DT_NEEDED entry
    LOADER=`patchelf --print-interpreter $ADDON/bin/node`
    cp -a $SRCROOT$LOADER $ADDON/lib/`basename $LOADER`

    # Point everything inside the addon: absolute prefix path first (the
    # installed location), $ORIGIN as well so the tree also works elsewhere.
    patchelf --set-interpreter $PREFIX/lib/`basename $LOADER` \
        --set-rpath "$PREFIX/lib:\$ORIGIN/../lib" $ADDON/bin/node

    rm -rf $SRCROOT

    # the Alpine package carries no LICENSE file; fetch Node's own
    NODE_LICENSE_TMP=$ADDON_TMP/LICENSE.node
    curl -fsSL --max-time 120 https://raw.githubusercontent.com/nodejs/node/v$NODE_VERSION/LICENSE > $NODE_LICENSE_TMP || exit 1
else
    case $ARCH in
      aarch64) NODE_NAME=node-v${NODE_VERSION}-linux-arm64 ;;
      x86_64)  NODE_NAME=node-v${NODE_VERSION}-linux-x64 ;;
    esac
    NODE_URL=https://nodejs.org/dist/v${NODE_VERSION}/${NODE_NAME}.tar.xz

    echo "download and extract Node.js $NODE_URL ..."
    curl --silent $NODE_URL | tar -xJf - -C $ADDON_TMP || exit 1
    mv $ADDON_TMP/$NODE_NAME $ADDON
    rm $ADDON/README.md
    rm $ADDON/CHANGELOG.md
    NODE_LICENSE_TMP=$ADDON_TMP/LICENSE.node
    mv $ADDON/LICENSE $NODE_LICENSE_TMP
fi

# --- bundled git (musl build from Alpine, self-contained via patchelf) ---
# Needed by the Node-RED projects feature and for npm installs from git URLs;
# the CCU firmware ships no git. In Alpine the git-core builtins are symlinks
# to ../../bin/git, which resolve correctly inside the addon tree as well.

echo "assembling git from alpine/$ALPINE_BRANCH/$ALPINE_ARCH ..."
GITROOT=$ADDON_TMP/alpine-git-root
alpine_fetch git $GITROOT || exit 1
[ -f $GITROOT/usr/bin/git ] || { echo "error: the git package did not contain usr/bin/git" >&2; exit 1; }

mkdir -p $ADDON/bin $ADDON/lib $ADDON/libexec $ADDON/share
GIT_MAIN=$ADDON/bin/git
cp -a $GITROOT/usr/bin/git $GIT_MAIN
cp -a $GITROOT/usr/libexec/git-core $ADDON/libexec/
if [ -d $GITROOT/usr/share/git-core ]; then
    cp -a $GITROOT/usr/share/git-core $ADDON/share/
fi

# the main binary plus every real (non-symlink) ELF in git-core
GIT_ELFS="$GIT_MAIN"
for f in $ADDON/libexec/git-core/*; do
    [ -f "$f" ] || continue
    [ -L "$f" ] && continue
    if head -c 4 "$f" | grep -q ELF; then
        GIT_ELFS="$GIT_ELFS $f"
    fi
done

SRCROOT=$GITROOT
copy_closure $GIT_ELFS || exit 1

GIT_LOADER=`patchelf --print-interpreter $GIT_MAIN`
if [ ! -e $ADDON/lib/`basename $GIT_LOADER` ]; then
    cp -a $GITROOT$GIT_LOADER $ADDON/lib/`basename $GIT_LOADER`
fi

for f in $GIT_ELFS; do
    patchelf --set-interpreter $PREFIX/lib/`basename $GIT_LOADER` --set-rpath "$PREFIX/lib" "$f"
done

rm -rf $GITROOT

echo "copying files to tmp dir..."
cp -r $ADDON_FILES/* $ADDON_TMP/

echo "copying assets to tmp dir..."
cp $BUILD_DIR/assets/redmatic5* $ADDON/www/
cp $BUILD_DIR/assets/favicon/apple-icon-180x180.png $ADDON/www/
cp $BUILD_DIR/assets/favicon/favicon-96x96.png $ADDON/www/
mv $NODE_LICENSE_TMP $ADDON/www/LICENSE.node.txt

echo "installing node modules..."
cd $ADDON/lib
npm install --no-package-lock --no-audit --no-fund --omit=dev --omit=optional --install-strategy=shallow || exit 1
npm sbom --sbom-format cyclonedx --omit dev --omit optional > $ADDON/www/sbom-runtime.json || exit 1
rm $ADDON/lib/package.json

# npm is bundled via lib/package.json on all architectures - (re)create the
# bin links (the Alpine nodejs package ships without npm, and this also
# replaces the tarball's links on the glibc architectures). corepack is not
# bundled; the npm install above prunes its module, so drop the tarball's link.
ln -sf ../lib/node_modules/npm/bin/npm-cli.js $ADDON/bin/npm
ln -sf ../lib/node_modules/npm/bin/npx-cli.js $ADDON/bin/npx
rm -f $ADDON/bin/corepack

echo "installing additional Node-RED nodes..."
cd $ADDON/var
npm install --silent --no-package-lock --no-audit --no-fund --omit=dev --omit=optional --install-strategy=shallow || exit 1
npm sbom --sbom-format cyclonedx --omit dev --omit optional > $ADDON/www/sbom-nodes.json || exit 1

echo "installing www node modules"
cd $ADDON/www
npm install --silent --no-package-lock --no-audit --no-fund --omit=dev --omit=optional || exit 1
npm sbom --sbom-format cyclonedx --omit dev --omit optional > $ADDON/www/sbom-www.json || exit 1

# the SBOMs are architecture-independent; attach them to releases
cp $ADDON/www/sbom-runtime.json $BUILD_DIR/dist/redmatic-$VERSION_ADDON-sbom-runtime.json
cp $ADDON/www/sbom-nodes.json $BUILD_DIR/dist/redmatic-$VERSION_ADDON-sbom-nodes.json
cp $ADDON/www/sbom-www.json $BUILD_DIR/dist/redmatic-$VERSION_ADDON-sbom-www.json

cd $BUILD_DIR

echo "creating version file"
RED_VERSION=`node -p "require('$ADDON/lib/node_modules/node-red/package.json').version"`

cat > $VERSION_FILE <<EOL
export NODE_VERSION=$NODE_VERSION
export VERSION_ADDON=$VERSION_ADDON
export RED_VERSION=$RED_VERSION
EOL
if [ -n "$ICU_VERSION" ]; then
    echo "export ICU_DATA=$PREFIX/share/icu/$ICU_VERSION" >> $VERSION_FILE
fi

echo "copying tools for $ARCH to tmp dir..."
cp -r $BUILD_DIR/tools/$ARCH/* $ADDON/

cd $ADDON_TMP
ln -s redmatic/bin/update_addon ./

# Self-check for the patched musl binaries: every library they ask for must be
# part of the tree, and the interpreter must point inside the prefix.
check_elf() {
    local f="$1" needed
    for needed in `patchelf --print-needed "$f"`; do
        [ -e "$ADDON/lib/$needed" ] || { echo "MISSING: $needed (for $f)" >&2; return 1; }
    done
    case `patchelf --print-interpreter "$f" 2>/dev/null` in
        $PREFIX/*|"") ;;
        *) echo "error: interpreter of $f points outside $PREFIX" >&2; return 1 ;;
    esac
}

check_elf $ADDON/bin/git || exit 1
if [ "$ARCH" == "armv7l" ]; then
    check_elf $ADDON/bin/node || exit 1
    echo "interpreter: `patchelf --print-interpreter $ADDON/bin/node`"
    echo "rpath:       `patchelf --print-rpath $ADDON/bin/node`"
fi

if [ "$ARCH" == "armv7l" ]; then
    ADDON_FILE=redmatic-$VERSION_ADDON.tar.gz
else
    ADDON_FILE=redmatic-$ARCH-$VERSION_ADDON.tar.gz
fi

echo "compressing addon package $ADDON_FILE ..."

cd $ADDON_TMP
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ -f /usr/local/bin/gtar ]]; then
        gtar --exclude=.DS_Store --owner=root --group=root -czf $BUILD_DIR/dist/$ADDON_FILE *
    else
        tar --exclude=.DS_Store -czf $BUILD_DIR/dist/$ADDON_FILE *
    fi
else
    tar --owner=root --group=root -czf $BUILD_DIR/dist/$ADDON_FILE *
fi

cd $BUILD_DIR

if command -v sha256sum >/dev/null 2>&1; then
    sha256sum $BUILD_DIR/dist/$ADDON_FILE > $BUILD_DIR/dist/$ADDON_FILE.sha256
else
    shasum -a 256 $BUILD_DIR/dist/$ADDON_FILE > $BUILD_DIR/dist/$ADDON_FILE.sha256
fi

echo "done."

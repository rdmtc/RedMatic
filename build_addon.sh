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
#   aarch64  RaspberryMatic 64-bit, glibc is current -> stock nodejs.org tarball.
#   x86_64   RaspberryMatic/debmatic on x86, glibc is current -> stock nodejs.org tarball.
#
# Requires: curl, tar, node, npm and - for armv7l - patchelf.

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
  armv7l | aarch64 | x86_64) ;;
  *)
    echo "usage: $0 <armv7l|aarch64|x86_64>" >&2
    exit 1
    ;;
esac

ADDON_FILES=$BUILD_DIR/addon_files
ADDON_TMP=$BUILD_DIR/addon_tmp
ADDON=$ADDON_TMP/redmatic
VERSION_FILE=$ADDON/versions

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*

echo "node version on build system: `node --version`"

ICU_VERSION=""

if [ "$ARCH" == "armv7l" ]; then
    command -v patchelf >/dev/null 2>&1 || { echo "error: patchelf is required for the armv7l build" >&2; exit 1; }

    mkdir -p $ADDON/bin $ADDON/lib

    # Resolve nodejs and everything it needs from the Alpine package index,
    # then download and unpack the .apk files (concatenated gzipped tars).
    PACKAGES=`node $BUILD_DIR/alpine-packages.mjs nodejs armv7 $ALPINE_BRANCH $ALPINE_MIRROR` || exit 1
    APK_VERSION=`echo "$PACKAGES" | sed -n 's|.*/nodejs-\(.*\)\.apk$|\1|p' | head -1`
    NODE_VERSION_ARMV7L=${APK_VERSION%%-r*}
    case $NODE_VERSION_ARMV7L in
        $NODE_MAJOR.*) ;;
        *)
            echo "error: alpine/$ALPINE_BRANCH/armv7 ships nodejs $NODE_VERSION_ARMV7L, expected ${NODE_MAJOR}.x." >&2
            echo "       Pick another ALPINE_BRANCH or move engines.node in package.json." >&2
            exit 1
            ;;
    esac
    echo "alpine/$ALPINE_BRANCH/armv7: nodejs $APK_VERSION"
    NODE_VERSION=$NODE_VERSION_ARMV7L

    ROOT=$ADDON_TMP/alpine-root
    rm -rf $ROOT
    mkdir -p $ROOT
    for url in $PACKAGES; do
        echo "download and extract `basename $url` ..."
        curl -fsSL --max-time 300 "$url" | tar -xzf - -C $ROOT 2>/dev/null
    done

    [ -f $ROOT/usr/bin/node ] || { echo "error: the nodejs package did not contain usr/bin/node" >&2; exit 1; }
    cp -a $ROOT/usr/bin/node $ADDON/bin/node

    # Copy the transitive DT_NEEDED closure of the node binary. Only these
    # libraries end up in the package - not everything apk happened to unpack.
    copy_lib() {
        local name="$1" dir real base
        [ -e "$ADDON/lib/$name" ] && return 0
        for dir in "$ROOT/lib" "$ROOT/usr/lib"; do
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

    queue="$ADDON/bin/node"
    while [ -n "$queue" ]; do
        current=${queue%% *}
        queue=${queue#"$current"}
        queue=${queue# }
        for needed in `patchelf --print-needed "$current" 2>/dev/null`; do
            if [ ! -e "$ADDON/lib/$needed" ]; then
                copy_lib "$needed" || exit 1
                queue="$queue `readlink -f $ADDON/lib/$needed`"
            fi
        done
    done

    # ICU data. Alpine builds node against the system ICU, whose data lives in
    # a .dat file under a path compiled into the library (/usr/share/icu/<ver>).
    # That path does not exist on a CCU, so the data ships inside the addon and
    # the runtime scripts export ICU_DATA (via the versions file); without it
    # node does not start.
    if [ -d $ROOT/usr/share/icu ]; then
        mkdir -p $ADDON/share
        cp -a $ROOT/usr/share/icu $ADDON/share/
        ICU_VERSION=`ls $ADDON/share/icu | head -1`
    else
        echo "error: no ICU data in the staging root - node would not start" >&2
        exit 1
    fi

    # the ELF interpreter itself (musl's loader), which is not a DT_NEEDED entry
    LOADER=`patchelf --print-interpreter $ADDON/bin/node`
    cp -a $ROOT$LOADER $ADDON/lib/`basename $LOADER`

    # Point everything inside the addon: absolute prefix path first (the
    # installed location), $ORIGIN as well so the tree also works elsewhere.
    patchelf --set-interpreter $PREFIX/lib/`basename $LOADER` \
        --set-rpath "$PREFIX/lib:\$ORIGIN/../lib" $ADDON/bin/node
    for lib in $ADDON/lib/*; do
        [ -L "$lib" ] && continue
        case `basename "$lib"` in
            ld-musl-*) continue ;;
        esac
        patchelf --set-rpath "$PREFIX/lib:\$ORIGIN" "$lib"
    done

    rm -rf $ROOT

    curl -fsSL --max-time 120 https://raw.githubusercontent.com/nodejs/node/v$NODE_VERSION/LICENSE > $BUILD_DIR/licenses/nodejs || true
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
    mv $ADDON/LICENSE $BUILD_DIR/licenses/nodejs
fi

echo "copying files to tmp dir..."
cp -r $ADDON_FILES/* $ADDON_TMP/

echo "copying assets to tmp dir..."
cp $BUILD_DIR/assets/redmatic5* $ADDON/www/
cp $BUILD_DIR/assets/favicon/apple-icon-180x180.png $ADDON/www/
cp $BUILD_DIR/assets/favicon/favicon-96x96.png $ADDON/www/

echo "installing node modules..."
cd $ADDON/lib
npm install --no-package-lock --no-audit --no-fund --omit=dev --omit=optional --install-strategy=shallow || exit 1
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

echo "installing www node modules"
cd $ADDON/www
npm install --silent --no-package-lock --no-audit --no-fund --omit=dev --omit=optional || exit 1

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

# Self-check for the patched armv7l runtime: every library the binary asks
# for must be part of the tree, and the interpreter must point inside the prefix.
if [ "$ARCH" == "armv7l" ]; then
    echo "interpreter: `patchelf --print-interpreter $ADDON/bin/node`"
    echo "rpath:       `patchelf --print-rpath $ADDON/bin/node`"
    MISSING=0
    for needed in `patchelf --print-needed $ADDON/bin/node`; do
        [ -e "$ADDON/lib/$needed" ] || { echo "MISSING: $needed" >&2; MISSING=1; }
    done
    [ "$MISSING" == "0" ] || exit 1
    case `patchelf --print-interpreter $ADDON/bin/node` in
        $PREFIX/*) ;;
        *) echo "error: interpreter points outside $PREFIX" >&2; exit 1 ;;
    esac
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

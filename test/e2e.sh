#!/bin/bash
#
# End-to-end test of a built x86_64 addon package in a Debian container
# (ROADMAP task 10). Replays the OpenCCU installation path twice - fresh
# install, then update - and checks that Node-RED starts, runs from a stable
# working directory, has the palette editor enabled, loads the ccu nodes and
# can install and remove a node through the palette API.
#
#   test/e2e.sh [dist-dir]      default: ./dist (needs docker)
#
# The container talks to the npm registry (palette install) but not to the
# telemetry host (blocked via /etc/hosts).

set -o pipefail

BUILD_DIR=`cd ${0%/*}/.. && pwd -P`
DIST=${1:-$BUILD_DIR/dist}
DIST=`cd "$DIST" && pwd -P` || { echo "error: $DIST not found" >&2; exit 1; }

ls "$DIST"/redmatic-x86_64-*.tar.gz >/dev/null 2>&1 || {
    echo "error: no redmatic-x86_64-*.tar.gz in $DIST (run ./build_addon.sh x86_64 first)" >&2
    exit 1
}

command -v docker >/dev/null 2>&1 || { echo "error: docker is required" >&2; exit 1; }

exec docker run --rm --platform linux/amd64 \
    -v "$DIST:/dist:ro" \
    -v "$BUILD_DIR/test/e2e-inner.sh:/e2e-inner.sh:ro" \
    debian:bookworm-slim bash /e2e-inner.sh

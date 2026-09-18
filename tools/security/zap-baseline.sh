#!/bin/sh
# Passive scan only, on an explicitly authorized non-production HTTPS host.
set -eu
: "${AUTHORIZED_STAGING_ORIGIN:?Set the exact owned staging origin}"
: "${ZAP_IMAGE:?Set a reviewed image pinned as ghcr.io/zaproxy/zaproxy@sha256:...}"
: "${SECURITY_TEST_AUTHORIZED:?Set to yes only with written authorization}"
[ "$SECURITY_TEST_AUTHORIZED" = "yes" ] || exit 2
case "$AUTHORIZED_STAGING_ORIGIN" in https://*) ;; *) echo 'HTTPS staging origin required'; exit 2;; esac
case "$ZAP_IMAGE" in ghcr.io/zaproxy/zaproxy@sha256:*) ;; *) echo 'Reviewed digest required'; exit 2;; esac
mkdir -p reports/local/zap
# The directory must be writable by the image runtime user; adjust host ownership, not chmod 777.
docker run --rm -v "$(pwd)/reports/local/zap:/zap/wrk:rw" "$ZAP_IMAGE" \
  zap-baseline.py -t "$AUTHORIZED_STAGING_ORIGIN" -m 1 -r baseline.html -J baseline.json
# Exit codes are preserved. Warnings are not silently converted into success.

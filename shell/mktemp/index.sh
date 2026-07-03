#!/usr/bin/env bash
TMPFILE=$(mktemp) || exit 1
echo "Our temp file is $TMPFILE"
rm -rf ${TMPFILE}

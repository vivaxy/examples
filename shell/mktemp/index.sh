#!/usr/bin/env bash
# @since 2019-12-30 10:26
# @author vivaxy
TMPFILE=$(mktemp) || exit 1
echo "Our temp file is $TMPFILE"
rm -rf ${TMPFILE}

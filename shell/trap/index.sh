#!/usr/bin/env bash
# @since 2019-12-30 10:31
# @author vivaxy
function beforeExit() {
  SUPPORTED_TRAP_SIGN=`trap -l`
  echo "SUPPORTED_TRAP_SIGN"${SUPPORTED_TRAP_SIGN}
  echo 'exiting'
}
trap beforeExit EXIT

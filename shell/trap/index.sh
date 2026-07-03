#!/usr/bin/env bash
function beforeExit() {
  SUPPORTED_TRAP_SIGN=`trap -l`
  echo "SUPPORTED_TRAP_SIGN"${SUPPORTED_TRAP_SIGN}
  echo 'exiting'
}
trap beforeExit EXIT

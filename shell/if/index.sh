#!/usr/bin/env bash
# @since 2020-01-15 10:46
# @author vivaxy
if [ "${NODE_ENV}" == "" ]
then
  echo "Please Supply NODE_ENV: NODE_ENV=production sh ./index.sh"
else
  echo "NODE_ENV=${NODE_ENV}"
fi

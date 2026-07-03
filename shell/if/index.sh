#!/usr/bin/env bash
if [ -z "${NODE_ENV}" ]
then
  echo "Please Supply NODE_ENV: NODE_ENV=production sh ./index.sh"
else
  echo "NODE_ENV=${NODE_ENV}"
fi

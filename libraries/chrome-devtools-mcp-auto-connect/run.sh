#!/usr/bin/env zsh

set -euo pipefail

script_dir=${0:A:h}

cd "$script_dir"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  unset npm_config_prefix
  source "$HOME/.nvm/nvm.sh"
  nvm use >/dev/null
fi

exec node index.js "$@"

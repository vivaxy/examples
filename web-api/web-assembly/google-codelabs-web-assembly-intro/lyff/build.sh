#!/bin/bash

emcc \
  -s WASM=1 -s ONLY_MY_CODE=1 -s EXPORTED_FUNCTIONS="['_board_init','_board_ref','_board_step']" \
  -o output.js *.c

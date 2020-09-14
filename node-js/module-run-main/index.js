#!/usr/bin/env node
/**
 * @since 2020-09-14 19:28
 * @author vivaxy
 */
const path = require('path');

function runBin(binPath, args = []) {
  const Module = require('module');
  const originalArgv = process.argv;
  process.argv = [process.argv[0], binPath, ...args];
  Module.runMain(); // https://github.com/npm/npx/blob/84eeb547522b8bdfcb0949d4a6a725613932ec85/index.js#L268
  process.argv = originalArgv;
}

function main() {
  // OUTPUT
  // 1
  // 0
  runBin(path.join(__dirname, '0.js'));
  console.log(1);
}

main();

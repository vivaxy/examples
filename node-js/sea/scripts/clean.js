const { rmSync } = require('fs');

const version = process.versions.node;
const targets = [
  'hello',
  'hello.exe',
  'hello-arm64',
  'hello-x64',
  'sea-config-arm64.json',
  'sea-config-x64.json',
  'sea-prep.blob',
  `node-v${version}-darwin-arm64.tar.gz`,
  `node-v${version}-darwin-x64.tar.gz`,
  `node-v${version}-darwin-arm64`,
  `node-v${version}-darwin-x64`,
];

for (const target of targets) {
  rmSync(target, { recursive: true, force: true });
}

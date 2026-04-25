const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');

const arch = process.argv[2];
if (arch !== 'arm64' && arch !== 'x64') {
  console.error('Usage: node scripts/build-arch.js <arm64|x64>');
  process.exit(1);
}

const version = process.versions.node;
const dir = `node-v${version}-darwin-${arch}`;
const tarball = `${dir}.tar.gz`;
const out = `hello-${arch}`;
const config = `sea-config-${arch}.json`;
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

if (!existsSync(dir)) {
  run(`curl -sSLO https://nodejs.org/dist/v${version}/${tarball}`);
  run(`tar -xzf ${tarball}`);
}

const base = JSON.parse(readFileSync('sea-config.json', 'utf8'));
writeFileSync(
  config,
  JSON.stringify(
    {
      ...base,
      executable: `${dir}/bin/node`,
      output: out,
      useCodeCache: false,
      useSnapshot: false,
    },
    null,
    2,
  ) + '\n',
);

run(`node --build-sea ${config}`);
run(`codesign --sign - ${out}`);

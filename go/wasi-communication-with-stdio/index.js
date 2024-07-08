/**
 * @since 2024-07-08
 * @author vivaxy
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { WASI } from 'wasi';

const uniqueId = crypto.randomUUID();

const stdinFile = path.join(os.tmpdir(), `stdin.wasm.${uniqueId}.txt`);
const stdoutFile = path.join(os.tmpdir(), `stdout.wasm.${uniqueId}.txt`);
const stderrFile = path.join(os.tmpdir(), `stderr.wadm.${uniqueId}.txt`);

fs.writeFileSync(stdinFile, 'Start writing to stdin...');

const stdin = fs.openSync(stdinFile, 'r');
const stdout = fs.openSync(stdoutFile, 'a');
const stderr = fs.openSync(stderrFile, 'a');

const wasi = new WASI({
  args: [],
  env: {},
  stdin,
  stdout,
  stderr,
  returnOnExit: true,
});

const importObject = { wasi_snapshot_preview1: wasi.wasiImport };

(async () => {
  const wasm = await WebAssembly.compile(
    fs.readFileSync('./main.wasm'), // adapt the path
  );
  const instance = await WebAssembly.instantiate(wasm, importObject);

  // 👋 send data to the WASM program
  fs.writeFileSync(stdinFile, 'Hello Bob Morane');

  wasi.start(instance);

  // 👋 get the result
  console.log(fs.readFileSync(stdoutFile, 'utf8').trim());
  // 👋 get the error
  console.log(fs.readFileSync(stderrFile, 'utf8').trim());

  fs.closeSync(stdin);
  fs.closeSync(stdout);
  fs.closeSync(stderr);
})();

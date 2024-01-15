/**
 * @since 2024-01-15
 * @author vivaxy
 */
const memory = new WebAssembly.Memory({
  initial: 10240,
  maximum: 10240,
});

const HEAPU8 = new Uint8Array(memory.buffer);
const HEAPU32 = new Uint32Array(memory.buffer);
const printCharBuffers = [null, [], []];

const out = console.log.bind(console);
const err = console.error.bind(console);

function printChar(stream, curr) {
  const buffer = printCharBuffers[stream];
  assert(buffer);
  if (curr === 0 || curr === 10) {
    (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
    buffer.length = 0;
  } else {
    buffer.push(curr);
  }
}

function _fd_write(fd, iov, iovcnt, pnum) {
  // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
  let num = 0;
  for (let i = 0; i < iovcnt; i++) {
    let ptr = HEAPU32[iov >> 2];
    let len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    for (let j = 0; j < len; j++) {
      printChar(fd, HEAPU8[ptr + j]);
    }
    num += len;
  }
  HEAPU32[pnum >> 2] = num;
  return 0;
}

const importObj = {
  env: {},
};

const wa = await WebAssembly.instantiateStreaming(
  fetch('loop.wasm'),
  importObj,
);

setTimeout(function () {
  console.log('some code in event queue before wasm executes');
});
console.log('before wasm code');
console.time('wasm code cost');
console.log(wa.instance.exports.loop(1e8));
console.timeEnd('wasm code cost');
console.log('after wasm code');

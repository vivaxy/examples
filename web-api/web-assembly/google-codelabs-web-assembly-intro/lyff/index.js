async function createWebAssembly(path, importObject) {
  const result = await window.fetch(path);
  const bytes = await result.arrayBuffer();
  return WebAssembly.instantiate(bytes, importObject);
}

const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
let exports = null;

async function init() {
  const env = {
    abortStackOverflow: (_) => {
      throw new Error('overflow');
    },
    table: new WebAssembly.Table({
      initial: 0,
      maximum: 0,
      element: 'anyfunc',
    }),
    tableBase: 0,
    memory: memory,
    memoryBase: 1024,
    STACKTOP: 0,
    STACK_MAX: memory.buffer.byteLength,
  };
  const importObject = { env };

  const wa = await createWebAssembly('output.wasm', importObject);
  exports = wa.instance.exports;
  console.info('got exports', exports);
  exports._board_init(); // setup lyff board

  draw();
}

function getBoardBuffer() {
  return new Uint8Array(memory.buffer, exports._board_ref());
}

function draw() {
  const buffer = getBoardBuffer();
  const dim = 100; // nb. fixed size
  canvas.width = canvas.height = dim + 2;
  canvas.style.width = canvas.style.height = `${dim * 5}px`;
  const data = new ImageData(canvas.width, canvas.height);

  for (let x = 1; x <= dim; ++x) {
    for (let y = 1; y <= dim; ++y) {
      const pos = y * (dim + 2) + x;
      const i = (pos / 8) << 0;
      const off = 1 << pos % 8;

      const alive = buffer[i] & off;
      if (!alive) {
        continue;
      }

      const doff = (y * canvas.width + x) * 4;
      data.data[doff + 0] = 255;
      data.data[doff + 3] = 255;
    }
  }

  canvas.getContext('2d').putImageData(data, 0, 0);

  requestAnimationFrame(() => {
    exports._board_step();
    draw();
  });
}

init();

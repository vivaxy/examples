/**
 * @since 20180305 15:24
 * @author vivaxy
 */

const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
const importObj = {
  env: {
    abortStackOverflow: () => {
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
  },
};

// fetch('bezier.wasm')
//     .then((response) => {
//         return response.arrayBuffer()
//     })
//     .then((bytes) => {
//         return aWebAssembly.instantiate(bytes, importObj)
//     })
//     .then((wa) => {
//         console.log(wa.instance.exports._bezier(0.5, 10, 20))
//     });

WebAssembly.instantiateStreaming(fetch('bezier.wasm'), importObj).then((wa) => {
  console.log(wa.instance.exports._bezier(0.5, 10, 20));
});

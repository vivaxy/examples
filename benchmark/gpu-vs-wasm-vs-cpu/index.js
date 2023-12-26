/**
 * @since 2023-12-26
 * @author vivaxy
 */
import { run } from 'https://vivaxy.github.io/framework/utils/benchmark.js';

function generateArray(length) {
  return Array.from({ length }, function (_, i) {
    return i;
  });
}

// todo calculation result mismatch. possible precision lost
function testGPU(ctx) {
  const multiplyMatrix = ctx.gpu.createKernel(
    function (innerArray) {
      let sum = innerArray[this.thread.x];
      for (let i = 0; i < 10240; i++) {
        sum += innerArray[i];
      }
      return sum;
    },
    {
      output: [ctx.array.length],
      precision: 'single',
    },
  );

  const result = multiplyMatrix(ctx.array);
  ctx.result = Array.from(result);
}

function testWASM(ctx) {
  const { sumAdd, memory, array } = ctx;
  const wasmArray = new Int32Array(memory.buffer, 0, array.length);
  wasmArray.set(array);
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(sumAdd(wasmArray, i));
  }
  ctx.result = result;
}

function testCPU(ctx) {
  const result = [];
  for (let i = 0; i < ctx.array.length; i++) {
    let sum = ctx.array[i];
    for (let i = 0; i < ctx.array.length; i++) {
      sum += ctx.array[i];
    }
    result.push(sum);
  }
  ctx.result = result;
}

async function runTest({ name, fn, beforeAll }) {
  console.log(
    name,
    await run(fn, {
      loop: 10,
      beforeAll,
      beforeEach(ctx) {
        ctx.array = generateArray(10240);
      },
      afterAll(ctx) {
        console.log(ctx.result);
      },
    }),
  );
}

setTimeout(async function () {
  await runTest({
    name: 'GPU',
    fn: testGPU,
    beforeAll(ctx) {
      ctx.gpu = new GPU.GPU();
    },
  });
  await runTest({
    name: 'WASM',
    fn: testWASM,
    async beforeAll(ctx) {
      const memory = new WebAssembly.Memory({
        initial: 10240,
        maximum: 10240,
      });
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
          memoryBase: 10240,
          STACKTOP: 0,
          STACK_MAX: memory.buffer.byteLength,
        },
      };
      const wa = await WebAssembly.instantiateStreaming(
        fetch('wasm/sum-add.wasm'),
        importObj,
      );
      ctx.sumAdd = wa.instance.exports.sumAdd;
      ctx.memory = wa.instance.exports.memory;
    },
  });
  await runTest({ name: 'CPU', fn: testCPU });
}, 1000);

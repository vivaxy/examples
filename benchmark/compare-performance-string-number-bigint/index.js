/**
 * @since 2024-07-02
 * @author vivaxy
 */
// @ts-expect-error run
import { run } from 'https://vivaxy.github.io/framework/utils/benchmark.js';

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
function bytesToHexString(bytes) {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += (bytes[i] >> 4).toString(16) + (bytes[i] & 0xf).toString(16);
  }
  return result;
}

/**
 *
 * @param {Uint8Array} bytes
 * @return {string}
 */
function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join('');
  return btoa(binString);
}

/**
 * @param {number} number
 * @return {Uint8Array}
 */
function numberToBytes(number) {
  const dataView = new DataView(new ArrayBuffer(8), 0);
  dataView.setBigUint64(0, BigInt(number));
  return new Uint8Array(dataView.buffer);
}

/**
 * @param {number} number
 * @return {string}
 */
function string(number) {
  // return bytesToBase64(numberToBytes(number));
  return bytesToHexString(numberToBytes(number));
}

/**
 * @param {number} number
 * @return {number}
 */
function number(number) {
  return number;
}

/**
 * @param {number} number
 * @return {bigint}
 */
function bigint(number) {
  return BigInt(number);
}

/**
 * @param {number} timeout
 * @return {Promise<void>}
 */
function sleep(timeout) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, timeout);
  });
}

async function main() {
  const LOOP = 1e3;
  const ARRAY_LENGTH = 1e5;
  for (const fn of [string, number, bigint]) {
    const cost = await run(
      function (ctx) {
        for (let i = 0; i < ctx.values.length - 1; i++) {
          if (ctx.values[i] <= ctx.values[i + 1]) {
            console.log('error');
          }
        }
      },
      {
        beforeEach(ctx) {
          ctx.values = Array.from({ length: ARRAY_LENGTH }, (_, i) => {
            return fn(2 ** 52 - i);
          });
        },
        loop: LOOP,
      },
    );
    console.log(`${fn.name} cost: ${cost}ms`);
    await sleep(100);
  }

  await sleep(100);
  const cost = await run(
    function (ctx) {
      for (let i = 0; i < ctx.values.length - 1; i++) {
        if (parseInt(ctx.values[i], 16) <= parseInt(ctx.values[i + 1], 16)) {
          console.log('error');
        }
      }
    },
    {
      beforeEach(ctx) {
        ctx.values = Array.from({ length: ARRAY_LENGTH }, (_, i) => {
          return string(2 ** 52 - i);
        });
      },
      loop: LOOP,
    },
  );
  console.log(`string(parseInt) cost: ${cost}ms`);
}

setTimeout(main, 1000);

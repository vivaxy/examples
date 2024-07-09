/**
 * @since 2024-07-02
 * @author vivaxy
 */
// @ts-expect-error run
import { run } from 'https://vivaxy.github.io/framework/utils/benchmark.js';
import {
  number,
  bigint,
  hexString,
  // base64String,
  charCodeString,
  exponentNumber,
} from './utils/generate-values.js';

/**
 * @param {number} timeout
 * @return {Promise<void>}
 */
function sleep(timeout) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, timeout);
  });
}

/**
 * @param {object} ctx
 * @param {(number) => *} fn
 * @param {number} ARRAY_LENGTH
 */
function beforeEach(ctx, fn, ARRAY_LENGTH) {
  ctx.values = Array.from({ length: ARRAY_LENGTH }, (_, i) => {
    return fn(i);
  }).concat(
    Array.from({ length: ARRAY_LENGTH }, (_, i) => {
      return fn(2 ** 53 - ARRAY_LENGTH + i);
    }),
  );
}

async function main() {
  const LOOP = 1e2;
  const ARRAY_LENGTH = 1e5;
  for (const fn of [
    number,
    bigint,
    hexString,
    // base64String,
    charCodeString,
    exponentNumber,
  ]) {
    const cost = await run(
      /**
       * @param {object} ctx
       */
      function (ctx) {
        for (let i = 0; i < ctx.values.length - 1; i++) {
          if (ctx.values[i] >= ctx.values[i + 1]) {
            console.log('error');
          }
        }
      },
      {
        /**
         * @param {object} ctx
         */
        beforeEach(ctx) {
          beforeEach(ctx, fn, ARRAY_LENGTH);
        },
        loop: LOOP,
      },
    );
    console.log(`${fn.name} cost: ${cost}ms`);
    await sleep(100);
  }

  await sleep(100);
  const cost = await run(
    /**
     * @param {object} ctx
     */
    function (ctx) {
      for (let i = 0; i < ctx.values.length - 1; i++) {
        if (parseInt(ctx.values[i], 16) >= parseInt(ctx.values[i + 1], 16)) {
          console.log('error');
        }
      }
    },
    {
      /**
       * @param {object} ctx
       */
      beforeEach(ctx) {
        beforeEach(ctx, hexString, ARRAY_LENGTH);
      },
      loop: LOOP,
    },
  );
  console.log(`${hexString.name}(parseInt) cost: ${cost}ms`);
}

setTimeout(main, 1000);

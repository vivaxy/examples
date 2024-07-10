/**
 * @since 2024-07-02
 * @author vivaxy
 */
// @ts-expect-error run
import {
  run,
  getDiff,
  toSignedPercentage,
} from 'https://unpkg.com/@vivaxy/framework/utils/benchmark.js';
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
  const INNER_LOOP = 1e2;
  const ARRAY_LENGTH = 1e5;
  let base = 0;
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
        const { values } = ctx;
        for (let j = 0; j < INNER_LOOP; j++) {
          for (let i = 0; i < values.length - 1; i++) {
            if (values[i] >= values[i + 1]) {
              console.log('error');
            }
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
    if (fn === number) {
      base = cost;
    }
    console.log(
      `${fn.name} cost: ${cost}ms (${toSignedPercentage(getDiff(base, cost))})`,
    );
    await sleep(100);
  }

  // await sleep(100);
  // const cost = await run(
  //   /**
  //    * @param {object} ctx
  //    */
  //   function (ctx) {
  //     const { values } = ctx;
  //     for (let j = 0; j < INNER_LOOP; j++) {
  //       for (let i = 0; i < values.length - 1; i++) {
  //         if (parseInt(values[i], 16) >= parseInt(values[i + 1], 16)) {
  //           console.log('error');
  //         }
  //       }
  //     }
  //   },
  //   {
  //     /**
  //      * @param {object} ctx
  //      */
  //     beforeEach(ctx) {
  //       beforeEach(ctx, hexString, ARRAY_LENGTH);
  //     },
  //     loop: LOOP,
  //   },
  // );
  // console.log(`${hexString.name}(parseInt) cost: ${cost}ms (${toSignedPercentage(getDiff(base, cost))})`);
}

setTimeout(main, 1000);

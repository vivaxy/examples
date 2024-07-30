/**
 * @since 2024-07-29
 * @author vivaxy
 * @see https://stackoverflow.com/questions/6772757/using-the-push-method-or-length-when-adding-to-array
 */
import {
  run,
  // @ts-expect-error benchmark
} from 'https://unpkg.com/@vivaxy/framework/utils/benchmark.js';

async function main() {
  const length = 1e5;

  /**
   * @param {*[]} array
   * @param {(arr: *[], i: *) => void} handler
   */
  function forEach(array, handler) {
    for (let i = 0; i < length; i++) {
      handler(array, i);
    }
  }

  // preheat
  const array0 = [];
  await run(function () {
    forEach(array0, function (arr, i) {
      arr[arr.length] = i;
    });
  });

  const array1 = [];
  const arrayPushCost = await run(function () {
    forEach(array1, function (arr, i) {
      arr.push(i);
    });
  });

  const array2 = [];
  const arrayLengthCost = await run(function () {
    forEach(array2, function (arr, i) {
      arr[arr.length] = i;
    });
  });

  const array3 = Array(length).fill(undefined);
  const arrayPredefinedLengthCost = await run(function () {
    forEach(array3, function (arr, i) {
      arr[arr.length] = i;
    });
  });

  console.log(
    `array.push() cost ${arrayPushCost}; array[array.length] cost ${arrayLengthCost}; predefined array length, array[array.length] cost ${arrayPredefinedLengthCost};`,
  );
}

main();

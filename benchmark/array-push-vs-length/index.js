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
  // preheat
  const array = [];
  for (let i = 0; i < 1e5; i++) {
    array[array.length] = i;
  }

  const arrayPushCost = await run(function () {
    const array = [];
    for (let i = 0; i < 1e5; i++) {
      array.push(i);
    }
    return array.length;
  });

  const arrayLengthCost = await run(function () {
    const array = [];
    for (let i = 0; i < 1e5; i++) {
      array[array.length] = i;
    }
    return array.length;
  });

  console.log(
    `array.push() cost ${arrayPushCost}; array[array.length] cost ${arrayLengthCost};`,
  );
}

main();

/**
 * @since 2024-07-10
 * @author vivaxy
 * @see https://github.com/grantila/fast-string-compare/blob/master/lib/index.ts
 */
import {
  run,
  getDiff,
  toSignedPercentage,
  // @ts-expect-error benchmark
} from 'https://unpkg.com/@vivaxy/framework/utils/benchmark.js';

/**
 * @param {string} string1
 * @param {string} string2
 * @return {number}
 */
function compareWithCharCode(string1, string2) {
  const length1 = string1.length;
  const length2 = string2.length;
  const minLength = Math.min(length1, length2);
  for (let i = 0; i < minLength; i++) {
    const char1 = string1.charCodeAt(i);
    const char2 = string2.charCodeAt(i);

    if (char1 > char2) {
      return 1;
    } else if (char1 < char2) {
      return -1;
    }
  }
  if (length1 > length2) {
    return 1;
  } else if (length1 < length2) {
    return -1;
  } else {
    return 0;
  }
}

async function main() {
  const strings = Array.from({ length: 1e5 }, function () {
    return Array.from({ length: Math.ceil(Math.random() * 100) }, function () {
      return String.fromCharCode(Math.random() * 0xffff);
    }).join('');
  });

  const results1 = [];
  const rawStringsCost = await run(function () {
    for (let i = 0; i < strings.length - 1; i += 1) {
      if (strings[i] > strings[i + 1]) {
        results1.push(1);
      } else if (strings[i] < strings[i + 1]) {
        results1.push(-1);
      } else {
        results1.push(0);
      }
    }
  });

  console.log(
    `compare raw strings in ${rawStringsCost}ms (${toSignedPercentage(
      getDiff(rawStringsCost, rawStringsCost),
    )})`,
  );

  const results2 = [];
  const charCodeCost = await run(function () {
    for (let i = 0; i < strings.length - 1; i += 1) {
      results2.push(compareWithCharCode(strings[i], strings[i + 1]));
    }
  });
  console.log(
    `compare strings in char code in ${charCodeCost}ms (${toSignedPercentage(
      getDiff(rawStringsCost, charCodeCost),
    )})`,
  );

  if (results1.length !== results2.length) {
    throw new Error();
  }
  for (let i = 0; i < results1.length; i += 1) {
    if (results1[i] !== results2[i]) {
      throw new Error();
    }
  }
  console.log('Compare results are same.');
}

setTimeout(main, 1000);

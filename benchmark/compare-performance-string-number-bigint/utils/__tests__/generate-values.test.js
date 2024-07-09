/**
 * @since 2024-07-09
 * @author vivaxy
 */
import { expect, test, describe } from 'vitest';
import {
  exponentNumber,
  numberToUint8Array,
  numberToUint16Array,
} from '../generate-values.js';

describe('exponentNumber', function () {
  test('should support max to 2 ** 53 - 1', () => {
    const v = exponentNumber(2 ** 53 - 1);
    expect(v * 2 ** 11).toBe(2 ** 53 - 1);
  });

  test('should follow law of distribution', () => {
    expect(exponentNumber(2 ** 53 - 1) - exponentNumber(2 ** 53 - 2)).toBe(
      exponentNumber(1),
    );
  });

  test('should keep precision', () => {
    for (let i = 1; i < 10; i++) {
      expect(
        exponentNumber(2 ** 53 - 1) - exponentNumber(2 ** 53 - 1 - i),
      ).toBe(exponentNumber(i));
    }
  });
});

function expectSameTypedArray(typedArray, expectedTypedArrayAsArray) {
  expect([...typedArray]).toStrictEqual([...expectedTypedArrayAsArray]);
}

describe('numberToUint8Array', function () {
  test('should convert correctly', function () {
    expectSameTypedArray(numberToUint8Array(255), [0, 0, 0, 0, 0, 0, 0, 255]);
    expectSameTypedArray(numberToUint8Array(256), [0, 0, 0, 0, 0, 0, 1, 0]);
  });
});

describe('numberToUint16Array', function () {
  test('should convert correctly', function () {
    expectSameTypedArray(numberToUint16Array(65535), [0, 0, 0, 65535]);
    expectSameTypedArray(numberToUint16Array(65536), [0, 0, 1, 0]);
  });
});

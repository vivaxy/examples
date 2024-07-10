/**
 * @since 2024-07-10
 * @author vivaxy
 */
import { expect, test } from 'vitest';
import { incrementToLong } from '../increment-to-long';

test('before max safe integer', function () {
  expect(incrementToLong(0)).toBe(1);
  expect(incrementToLong(100)).toBe(101);
  expect(incrementToLong(Number.MAX_SAFE_INTEGER - 1)).toBe(
    Number.MAX_SAFE_INTEGER,
  );
});

test('max safe integer', function () {
  expect(incrementToLong(Number.MAX_SAFE_INTEGER)).toBe(2 ** 52 * 2 ** 1);
});

test('on carry', function () {
  expect(incrementToLong((2 ** 53 - 1) * 2 ** 1)).toBe(2 ** 52 * 2 ** 2);
});

test('on max safe long', function () {
  expect(incrementToLong((2 ** 53 - 1) * 2 ** 10)).toBe(Infinity);
});

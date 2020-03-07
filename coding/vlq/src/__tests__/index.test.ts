/**
 * @since 20180911 17:16
 * @author vivaxy
 */
import { encode, decode } from '../index';
test('encode', function() {
  expect(encode(1)).toBe('C');
  expect(encode(23)).toBe('uB');
  expect(encode(-1)).toBe('D');
  expect(encode(-123)).toBe('3H');
});

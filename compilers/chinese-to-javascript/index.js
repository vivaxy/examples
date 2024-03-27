/**
 * @since 20180503 11:47
 * @author vivaxy
 */
import {
  test,
  expect,
} from 'https://unpkg.com/@vivaxy/framework/utils/web-test.js';
import { compiler } from './compiler.js';

test('compiler', function () {
  expect(compiler('(2 加 (4 减 2))')).toBe('(2 + (4 - 2));');
  expect(compiler('2 加 (4 减 2)')).toBe('2 + (4 - 2);');
});

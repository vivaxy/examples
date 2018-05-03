/**
 * @since 20180503 11:47
 * @author vivaxy
 */

const test = require('ava');
const compiler = require('../index.js');

test('compiler', (t) => {
  t.is(compiler('(2 加 (4 减 2))'), '(2 + (4 - 2));');
  t.is(compiler('2 加 (4 减 2)'), '2 + (4 - 2);');
});

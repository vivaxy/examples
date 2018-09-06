/**
 * @since 20180712 19:49
 * @author vivaxy
 */

const test = require('ava');
const longestCommonSubstring = require('../index.js');

test('longest common substring', (t) => {
  t.is(longestCommonSubstring('ABABC', 'BABCA'), 'BABC');
  t.is(longestCommonSubstring('BABCA', 'ABCBA'), 'ABC');
  t.is(longestCommonSubstring('AAB', 'AB'), 'AB');
});

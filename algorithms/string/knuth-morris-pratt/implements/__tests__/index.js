/**
 * @since 20180906 11:35
 * @author vivaxy
 */

const test = require('ava');
const knuthMorrisPratt = require('../index.js');

test('Knuth Morris Pratt', (t) => {
  t.is(knuthMorrisPratt('', ''), 0);
  t.is(knuthMorrisPratt('a', ''), 0);
  t.is(knuthMorrisPratt('a', 'a'), 0);
  t.is(knuthMorrisPratt('abcbcglx', 'abca'), -1);
  t.is(knuthMorrisPratt('abcbcglx', 'bcgl'), 3);
  t.is(knuthMorrisPratt('abcxabcdabxabcdabcdabcy', 'abcdabcy'), 15);
  t.is(knuthMorrisPratt('abcxabcdabxabcdabcdabcy', 'abcdabca'), -1);
  t.is(knuthMorrisPratt('abcxabcdabxaabcdabcabcdabcdabcy', 'abcdabca'), 12);
  t.is(knuthMorrisPratt('abcxabcdabxaabaabaaaabcdabcdabcy', 'aabaabaaa'), 11);
});

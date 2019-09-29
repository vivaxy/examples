/**
 * @since 20180906 11:35
 * @author vivaxy
 */

const test = require('ava');
const knuthMorrisPratt = require('../index.js');

test('Knuth Morris Pratt', (t) => {
  [
    ['', ''],
    ['a', ''],
    ['a', 'a'],
    ['abcbcglx', 'abca'],
    ['abcbcglx', 'bcgl'],
    ['abcxabcdabxabcdabcdabcy', 'abcdabcy'],
    ['abcxabcdabxabcdabcdabcy', 'abcdabca'],
    ['abcxabcdabxaabcdabcabcdabcdabcy', 'abcdabca'],
    ['abcxabcdabxaabaabaaaabcdabcdabcy', 'aabaabaaa'],
    ['bacabdabcdabcab', 'abcab'],
  ].forEach(function([text, pattern]) {
    t.is(knuthMorrisPratt(text, pattern), text.indexOf(pattern));
  });
});

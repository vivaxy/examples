/**
 * @since 20180906 11:35
 * @author vivaxy
 */
const knuthMorrisPratt = require('../index.js');

test('Knuth Morris Pratt', function() {
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
    expect(knuthMorrisPratt(text, pattern)).toBe(text.indexOf(pattern));
  });
});

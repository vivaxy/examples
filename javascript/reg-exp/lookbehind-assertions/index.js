/**
 * @since 2019-08-01 10:09
 * @author vivaxy
 */
// 正向先行断言 // positive lookahead assertions // (?=...)
console.log('正向先行断言 positive lookahead assertions (?=...)');
const positiveLookaheadAssertion = /a(?=b)/;

console.log(
  `${positiveLookaheadAssertion}.exec('a')`,
  positiveLookaheadAssertion.exec('a'),
); // → null
console.log(
  `${positiveLookaheadAssertion}.exec('ba')`,
  positiveLookaheadAssertion.exec('ba'),
); // → null
console.log(
  `${positiveLookaheadAssertion}.exec('b')`,
  positiveLookaheadAssertion.exec('b'),
); // → null
console.log(
  `${positiveLookaheadAssertion}.exec('a b')`,
  positiveLookaheadAssertion.exec('a b'),
); // → null
console.log(
  `${positiveLookaheadAssertion}.exec('ab')`,
  positiveLookaheadAssertion.exec('ab'),
); // → ['a', index: 0, input: 'ab', groups: undefined]

// 负向先行断言 // negative lookahead assertions // (?!...)
console.log('负向先行断言 negative lookahead assertions (?!...)');
const negativeLookaheadAssertion = /a(?!b)/;

console.log(
  `${negativeLookaheadAssertion}.exec('a')`,
  negativeLookaheadAssertion.exec('a'),
); // → ['a', index: 0, input: 'a', groups: undefined]
console.log(
  `${negativeLookaheadAssertion}.exec('ba')`,
  negativeLookaheadAssertion.exec('ba'),
); // → ['a', index: 1, input: 'ba', groups: undefined]
console.log(
  `${negativeLookaheadAssertion}.exec('b')`,
  negativeLookaheadAssertion.exec('b'),
); // → null
console.log(
  `${negativeLookaheadAssertion}.exec('a b')`,
  negativeLookaheadAssertion.exec('a b'),
); // → ['a', index: 0, input: 'a b', groups: undefined]
console.log(
  `${negativeLookaheadAssertion}.exec('ab')`,
  negativeLookaheadAssertion.exec('ab'),
); // → null

// 正向后行断言 // positive lookbehind assertions // (?<=...)
console.log('正向后行断言 positive lookbehind assertions (?<=...)');
const positiveLookbehindAssertion = /(?<=a)b/;

console.log(
  `${positiveLookbehindAssertion}.exec('a')`,
  positiveLookbehindAssertion.exec('a'),
); // → null
console.log(
  `${positiveLookbehindAssertion}.exec('ba')`,
  positiveLookbehindAssertion.exec('ba'),
); // → null
console.log(
  `${positiveLookbehindAssertion}.exec('b')`,
  positiveLookbehindAssertion.exec('b'),
); // → null
console.log(
  `${positiveLookbehindAssertion}.exec('a b')`,
  positiveLookbehindAssertion.exec('a b'),
); // → null
console.log(
  `${positiveLookbehindAssertion}.exec('ab')`,
  positiveLookbehindAssertion.exec('ab'),
); // → ['b', index: 1, input: 'ab', groups: undefined]

// 负向后行断言 // negative lookbehind assertions // (?<!...)
console.log('负向后行断言 negative lookbehind assertions (?<!...)');
const negativeLookbehindAssertion = /(?<!a)b/;

console.log(
  `${negativeLookbehindAssertion}.exec('a')`,
  negativeLookbehindAssertion.exec('a'),
); // → null
console.log(
  `${negativeLookbehindAssertion}.exec('ba')`,
  negativeLookbehindAssertion.exec('ba'),
); // → ['b', index: 0, input: 'ba', groups: undefined]
console.log(
  `${negativeLookbehindAssertion}.exec('b')`,
  negativeLookbehindAssertion.exec('b'),
); // → ['b', index: 0, input: 'b', groups: undefined]
console.log(
  `${negativeLookbehindAssertion}.exec('a b')`,
  negativeLookbehindAssertion.exec('a b'),
); // → ['b', index: 2, input: 'a b', groups: undefined]
console.log(
  `${negativeLookbehindAssertion}.exec('ab')`,
  negativeLookbehindAssertion.exec('ab'),
); // → null

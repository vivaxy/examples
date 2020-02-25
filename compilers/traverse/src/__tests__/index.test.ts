/**
 * @since 20180911 17:16
 * @author vivaxy
 */
import traverse from '..';

test('traverse simple rule', function() {
  const rules = `
Null ::= 'null'
`;
  expect(traverse(rules, 'null')).toStrictEqual({
    type: 'Null',
    value: ['null'],
  });
});

// test('traverse', function() {
//   // BNF
//   const rules = `
// S ::= Declarator Variables = Number
// Declarator ::= var | const | let
// Varibales ::= Variable [, Variables]
// Variable ::= /([a-zA-Z0-9]+)/
// Number ::= /([0-9]+)/
// `;
//   expect(traverse(rules, 'var a = 1')).toBe(true);
// });

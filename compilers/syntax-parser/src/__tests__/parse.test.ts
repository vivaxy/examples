/**
 * @since 20180911 17:16
 * @author vivaxy
 */
import parseRule from '../parse-rule';
import tokenize from '../tokenize';
import parse from '../parse';

test('keyword', function() {
  const rule = parseRule(`
Null ::= 'null' ;
`);
  const tokens = tokenize(
    [
      {
        type: 'Null',
        regExps: [/null/],
      },
    ],
    'null',
  );
  expect(parse(rule, tokens)).toMatchSnapshot();
});

// test('unary operation', function() {
//   const rule = `
// UnaryOperation ::= '+' Number ;
// Number ::= ([0-9]+)/
// `;
//   expect(traverse(rule, '+1')).toStrictEqual({
//     type: 'UnaryOperation',
//     value: [
//       '+',
//       {
//         type: 'Number',
//         value: '1',
//       },
//     ],
//   });
// });

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

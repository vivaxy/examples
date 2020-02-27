/**
 * @since 2020-02-26 03:57
 * @author vivaxy
 */
import tokenize from '../tokenize';

test('binary operation', function() {
  const patterns = [
    {
      type: 'Number',
      regExps: [/[0-9]+/],
    },
    {
      type: 'Operator',
      regExps: [/[\+|-]/],
    },
    {
      type: 'WhiteSpace',
      regExps: [/\s+/],
      ignore: true,
    },
  ];
  expect(tokenize(patterns, `1 + 2`)).toMatchSnapshot();
  expect(tokenize(patterns, `1 + 2 - 3`)).toMatchSnapshot();
  expect(tokenize(patterns, `1+2
-3

+4`)).toMatchSnapshot();
});

test('variable declaration', function() {
  const patterns = [
    {
      type: 'Declarator',
      regExps: [/let|var|const/],
    },
    {
      type: 'Identifier',
      regExps: [/[a-zA-Z0-9]+/],
    },
    {
      type: 'Operator',
      regExps: [/=/],
    },
    {
      type: 'WhiteSpace',
      regExps: [/\s+/],
      ignore: true,
    },
  ];
  expect(tokenize(patterns, `var a = b`)).toMatchSnapshot();
});

test('unexpected token', function () {
  expect(tokenize.bind(null, [], `unexpected token`)).toThrow('Unexpected token');
})

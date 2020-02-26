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
  const code = `1 + 2`;
  const tokens = tokenize(patterns, code);
  const expected = [
    {
      type: 'Number',
      value: '1',
      position: [0, 1],
    },
    {
      type: 'Operator',
      value: '+',
      position: [2, 3],
    },
    {
      type: 'Number',
      value: '2',
      position: [4, 5],
    },
  ];
  expect(tokens).toStrictEqual(expected);
});

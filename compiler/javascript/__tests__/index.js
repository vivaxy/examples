/**
 * @since 20180503 11:42
 * @author vivaxy
 */

const test = require('ava');
const compiler = require('../index.js');
const tokenTypes = compiler.tokenTypes;
const tokenizer = compiler.tokenizer;

test('tokenizer', (t) => {
  t.deepEqual(tokenizer('{{userGrade}} == 0'), [
    {
      type: tokenTypes.ARGUMENT,
      value: 'userGrade',
    },
    {
      type: tokenTypes.COMPARISON_OPERATOR,
      value: '==',
    },
    {
      type: tokenTypes.NUMBER,
      value: '0',
    },
  ]);

  t.deepEqual(tokenizer('"test"===\'value\''), [
    {
      type: tokenTypes.STRING,
      value: 'test',
    },
    {
      type: tokenTypes.COMPARISON_OPERATOR,
      value: '===',
    },
    {
      type: tokenTypes.STRING,
      value: 'value',
    },
  ]);
});

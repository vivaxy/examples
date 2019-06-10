/**
 * @since 2019-06-07 14:17:16
 * @author vivaxy
 */

const test = require('ava');
const { tokenizer, TYPES } = require('../index');

test('tokenizer', (t) => {
  t.deepEqual(tokenizer(`
/* comment */
`), [
    {
      type: TYPES.WHITE_SPACE,
      value: '\n',
    },
    {
      type: TYPES.BLOCK_COMMENT,
      value: '/* comment */',
    },
    {
      type: TYPES.WHITE_SPACE,
      value: '\n',
    },
  ]);
});

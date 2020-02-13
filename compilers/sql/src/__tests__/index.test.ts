/**
 * @since 2019-06-07 14:17:16
 * @author vivaxy
 */
import { tokenize, parse, TYPES } from '../index';

test('tokenize', function() {
  const tokens = tokenize(`
/* comment */
`);
  expect(tokens).toStrictEqual([
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

test('parse', function() {
  const tokens = tokenize('select a from b');
  const parsed = parse(tokens);
  expect(parsed).toStrictEqual(true);
});

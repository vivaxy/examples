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
  const sqls = ['select a from b', 'select a, b, c from b'];
  sqls.forEach(function(sql) {
    const tokens = tokenize(sql);
    const parsed = parse(tokens);
    if (!parsed) {
      console.log(sql);
    }
    expect(parsed).toStrictEqual(true);
  });
});

/**
 * @since 2020-03-10 07:34
 * @author vivaxy
 */
import parseVersion from '../parse-version';

test('parse stable version', function() {
  expect(parseVersion('1.0.0')).toStrictEqual([1, 0, 0, false, false]);
  expect(parseVersion('1.2.3')).toStrictEqual([1, 2, 3, false, false]);
});

test('parse prerelease version', function() {
  expect(parseVersion('1.0.0-1')).toStrictEqual([1, 0, 0, '1', false]);
  expect(parseVersion('1.0.0-beta.1')).toStrictEqual([
    1,
    0,
    0,
    'beta.1',
    false,
  ]);
  expect(parseVersion('1.0.0-.')).toStrictEqual([1, 0, 0, '.', false]);
  expect(parseVersion('1.0.0--')).toStrictEqual([1, 0, 0, '-', false]);
});

test('parse build version', function() {
  expect(parseVersion('1.0.0+1')).toStrictEqual([1, 0, 0, false, '1']);
  expect(parseVersion('1.0.0-1+1')).toStrictEqual([1, 0, 0, '1', '1']);
});

test('parse partial version', function() {
  expect(parseVersion('1')).toStrictEqual([1, 0, 0, false, false]);
  expect(parseVersion('1-1')).toStrictEqual([1, 0, 0, '1', false]);
  expect(parseVersion('1+1')).toStrictEqual([1, 0, 0, false, '1']);
  expect(parseVersion('1-1+1')).toStrictEqual([1, 0, 0, '1', '1']);
  expect(parseVersion('1+1-1')).toStrictEqual([1, 0, 0, false, '1-1']);
});

test('parse invalid version', function() {
  expect(() => parseVersion('1.')).toThrow('Invalid version (1.)');
  expect(() => parseVersion('.')).toThrow('Invalid version (.)');
  expect(() => parseVersion('')).toThrow('Invalid version ()');
  expect(() => parseVersion('1.+')).toThrow('Invalid version (1.+)');
  expect(() => parseVersion('1+')).toThrow('Invalid version (1+)');
  expect(() => parseVersion('1.')).toThrow('Invalid version (1.)');
  expect(() => parseVersion('1++')).toThrow('Invalid version (1++)');
  expect(() => parseVersion('1-')).toThrow('Invalid version (1-)');
});

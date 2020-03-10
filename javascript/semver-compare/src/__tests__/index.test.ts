/**
 * @since 2020-03-10 17:15:44
 * @author vivaxy
 */
import semverCompare from '..';

test('compare invalid version', function() {
  expect(() => semverCompare('a', 'b')).toThrow('Invalid version (a)');
  expect(() => semverCompare('1.0.0', 'b')).toThrow('Invalid version (b)');
  expect(() => semverCompare('1.a.0', 'b')).toThrow('Invalid version (1.a.0)');
  expect(() => semverCompare('1.', 'b')).toThrow('Invalid version (1.)');
  expect(() => semverCompare('1.0.', 'b')).toThrow('Invalid version (1.0.)');
  expect(() => semverCompare('1.0.0.', 'b')).toThrow(
    'Invalid version (1.0.0.)',
  );
});

test('compare stable version', function() {
  expect(semverCompare('1.0.0', '2.0.0')).toBe(1);
  expect(semverCompare('1.0.0', '1.1.0')).toBe(1);
  expect(semverCompare('1.0.0', '1.0.1')).toBe(1);
  expect(semverCompare('1.0.0', '1.0.0')).toBe(0);
  expect(semverCompare('1.0.1', '1.0.0')).toBe(-1);
  expect(semverCompare('1.1.0', '1.0.0')).toBe(-1);
  expect(semverCompare('2.0.0', '1.0.0')).toBe(-1);
});

test('compare stable version with prerelease version', function() {
  expect(() => semverCompare('1.0.0', '1.0.0.1')).toThrow(
    'Invalid version (1.0.0.1)',
  );
  expect(semverCompare('1.0.0', '1.0.0-1')).toBe(-1);
  expect(semverCompare('1.0.0', '1.0.0-beta')).toBe(-1);
  expect(semverCompare('1.0.0', '1.0.0-beta.1')).toBe(-1);
});

test('compare between prerelease versions', function() {
  expect(semverCompare('1.0.0-1', '1.0.0-2')).toBe(1);
  expect(semverCompare('1.0.0-alpha', '1.0.0-beta')).toBe(1);
  expect(semverCompare('1.0.0-beta.1', '1.0.0-beta.2')).toBe(1);
  expect(semverCompare('1.0.0', '1.0.0+1')).toBe(0);
});

test('compare partial version', function() {
  expect(semverCompare('1', '1.0.1')).toBe(1);
  expect(semverCompare('1.0', '1.0.1')).toBe(1);
  expect(semverCompare('1.0.0', '1.0-beta')).toBe(-1);
});

/**
 * @since 2021-08-01
 * @author vivaxy
 */
export function test(name, fn) {
  let passedAssertionCount = 0;
  let failedAssertionCount = 0;

  function expect(value, expected, message) {
    if (value !== expected) {
      failedAssertionCount++;
      console.error('  ', '❌', message, `Expect ${value} to be ${expected}.`);
      return;
    }
    passedAssertionCount++;
    console.log('  ', '✅', message);
  }

  try {
    console.log(name);
    fn(expect);
  } catch (e) {
    console.error('  ', '❌', e.message);
  }
}

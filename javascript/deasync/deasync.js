/**
 * @since 2023-10-13
 * @author vivaxy
 * @see https://github.com/abbr/deasync
 */
export default function deasync(asyncFunction) {
  let resolved = false;
  asyncFunction().then(function () {
    resolved = true;
  });
  while (!resolved) {
    const request = new XMLHttpRequest();
    request.open('GET', 'https://vivaxy.github.io/vivaxy.icon.png', false);
    request.send(null);
    console.log('waiting...');
  }
}

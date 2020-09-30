/**
 * @since 2020-09-30 10:27
 * @author vivaxy
 */
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

const fetchJS = new AsyncFunction('url', 'return await fetch(url);');
fetchJS('./index.js')
  .then((response) => response.text())
  .then((res) => console.log('js:\n', res))
  .catch((e) => console.error(e));

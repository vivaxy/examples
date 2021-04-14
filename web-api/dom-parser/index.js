/**
 * @since 2020-05-17 13:38
 * @author vivaxy
 */
const domParser = new DOMParser();

console.log(
  'parse HTML',
  domParser.parseFromString('<div class="a">b</div>', 'text/html'),
);
console.log(
  'parse XML',
  domParser.parseFromString('<x a="b">y</x>', 'text/xml'),
);
console.log('parse error', domParser.parseFromString('a', 'text/xml'));

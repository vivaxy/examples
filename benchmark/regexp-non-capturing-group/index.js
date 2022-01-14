/**
 * @since 2022-01-14
 * @author vivaxy
 */
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();

// add tests
suite
  .add('match', function () {
    'aaabbb'.match(/(a+)(b+)/);
  })
  .add('none match', function () {
    'aaabbb'.match(/(?:a+)(b+)/);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });

/**
 * @since 2021-10-19
 * @author vivaxy
 */
const Benchmark = require('benchmark');
const Rope = require('../index');

const suite = new Benchmark.Suite();

suite
  .add('string', function () {
    let str = 'ABCDEFG';
    // insert
    str = str.slice(0, 3) + 'X' + str.slice(3);
    // console.assert(str === 'ABCXDEFG', '1');
    // delete
    str = str.slice(0, 3) + str.slice(4);
    // console.assert(str === 'ABCDEFG', '2');
    // find
    const char = str[3];
    // console.assert(char === 'D', '3');
    // concat
    str += 'HIJKLMN';
    // console.assert(str === 'ABCDEFGHIJKLMN', '4');
    // split
    str = str.slice(0, 7);
    // console.assert(str === 'ABCDEFG', '5');
  })
  .add('rope', function () {
    const rope = new Rope('ABCDEFG');
    // insert
    rope.insert(3, 'X');
    // console.assert(rope.text === 'ABCXDEFG', '6');
    // delete
    rope.delete(3, 1);
    // console.assert(rope.text === 'ABCDEFG', '7');
    // find
    const char = rope.index(3);
    // console.assert(char === 'D', '8');
    // concat
    rope.concat(new Rope('HIJKLMN'));
    // console.assert(rope.text === 'ABCDEFGHIJKLMN', '9');
    // split
    rope.split(7);
    // console.assert(rope.text === 'ABCDEFG', '10');
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });

/*
string x 13,901,371 ops/sec ±1.94% (85 runs sampled)
rope x 5,328,986 ops/sec ±1.04% (86 runs sampled)
Fastest is string
*/

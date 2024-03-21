/**
 * @since 2019-04-19 09:53
 * @author vivaxy
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Benchmark = require('benchmark');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parse = require('@vivaxy/javascript/lib/parse.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const execute = require('@vivaxy/javascript/lib/execute.js');

const suite = new Benchmark.Suite();

const testcases = [
  {
    code: 'a > b',
    scope: {
      a: 1,
      b: 2,
    },
    result: false,
  },
  {
    code: 'a.b === 1',
    scope: {
      a: {
        b: 1,
      },
    },
    result: true,
  },
];

// add tests
suite
  .add('new Function', function () {
    testcases.forEach((testcase) => {
      const func = new Function(
        'scope',
        `with(scope) { return ${testcase.code} }`,
      );
      assert(func(testcase.scope) === testcase.result);
    });
  })
  .add('compiler', function () {
    testcases.forEach((testcase) => {
      const ast = parse(testcase.code);
      assert(execute(ast, testcase.scope) === testcase.result);
    });
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });

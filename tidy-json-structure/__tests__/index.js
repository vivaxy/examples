/**
 * @since 20180713 11:24
 * @author vivaxy
 */

const test = require('ava');
const tidyJsonStructure = require('../index.js');

test('Remove circular structure', (t) => {

  const a = {};
  a.a = a;

  t.deepEqual(tidyJsonStructure(a), { a: {} });

  const b = [];
  b[0] = b;

  t.deepEqual(tidyJsonStructure(b), [[]]);

});

test('Remove function values', (t) => {

  const a = {
    arrowFunction: () => {

    },
    function() {
    },
  };

  t.deepEqual(tidyJsonStructure(a), {});

});

test('Remove undefined values', (t) => {

  const a = {
    u: undefined,
  };

  t.deepEqual(tidyJsonStructure(a), {});

});

test('Remove prototype values', (t) => {

  class A {
    get prototypeProperty() {
      return 1;
    };

    prototypeFunction() {
    }
  }

  const a = new A();
  a.instanceProperty = 2;

  t.deepEqual(tidyJsonStructure(a), { instanceProperty: 2 });

});

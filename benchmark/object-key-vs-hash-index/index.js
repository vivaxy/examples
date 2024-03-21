/**
 * @since 2019-06-06 13:23
 * @author vivaxy
 *
 * Result:
 *
 * Store data as an object x 11,899,507 ops/sec ±0.54% (93 runs sampled)
 * Store data as an array x 1,314,807 ops/sec ±0.41% (95 runs sampled)
 * Fastest is Store data as an object
 *
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();

class ObjectKey {
  constructor() {
    this._data = {};
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
  }
}

function hashKey(key) {
  let hash = 0;
  for (let index = 0; index < key.length; index++) {
    // Oh look– magic.
    let code = key.charCodeAt(index);
    hash = ((hash << 5) - hash + code) | 0;
  }
  return hash;
}

class HashIndex {
  constructor() {
    this._data = [];
  }

  get(key) {
    return this._data[hashKey(key)];
  }

  set(key, value) {
    this._data[hashKey(key)] = value;
  }
}

const objectKey = new ObjectKey();
const hashIndex = new HashIndex();

function actions(o) {
  o.set('name', 'Alice');
  o.set('age', 18);
  o.get('name');
  o.get('age');
  o.set('name', 'Bob');
  o.set('age', 28);
  o.get('name');
  o.get('age');
  o.set('job', 'Software engineer');
  o.get('company');
}

// add tests
suite
  .add('Store data as an object', function () {
    actions(objectKey);
  })
  .add('Store data as an array', function () {
    actions(hashIndex);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

import memorize from './memorize.js';

function add(x, y) {
  console.log('add', x, y);
  return x + y;
}

const memorizedAdd = memorize(add);
console.log(memorizedAdd(1, 2));
console.log(memorizedAdd(1, 2));
console.log(memorizedAdd(1, 3));
console.log(memorizedAdd(1, 3));

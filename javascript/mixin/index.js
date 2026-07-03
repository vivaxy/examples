var a = {
    name: 'a',
    age: 12,
  },
  b = {
    name: 'b',
    age: 13,
    sex: 'male',
  },
  c = {
    address: 'shanghai',
  };

console.log(mixin(a, b, c));

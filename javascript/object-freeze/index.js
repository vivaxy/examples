/**
 * @since 2023-12-21
 * @author vivaxy
 * these piece of code will not reproduce when it is run in DevTools console
 */
// define a
let a = { n: 1 };

// freeze a
Object.freeze(a);

try {
  // set a to a new object {n:2}, set original a.x to {n:2}
  a.x = a = { n: 2 };
} catch (x) {
  // original a is frozen, so error thrown
  console.log('set original a.x error');
}

// a is set to a new object
console.log('new a.n', a.n);

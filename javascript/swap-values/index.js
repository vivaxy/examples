/**
 * @since 20180503 14:01
 * @author vivaxy
 */

function swapValues1([a, b]) {
  a = a - b;
  b = b + a;
  a = b - a;
  return [a, b];
}

function swapValues2([a, b]) {
  a = a + b;
  b = a - b;
  a = a - b;
  return [a, b];
}

exports.swapValues1 = swapValues1;
exports.swapValues2 = swapValues2;

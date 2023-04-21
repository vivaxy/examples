/**
 * @since 2023-04-21
 * @author vivaxy
 */
const { callHistory } = window.sdk;

window.sdk = {
  fn1(message) {
    console.log('fn1', message);
  },
  obj2: {
    fn2(message) {
      console.log('obj2.fn2', message);
    },
  },
};

callHistory.forEach(function ({ properties, args }) {
  let fn = window.sdk;
  properties.forEach(function (prop) {
    fn = fn[prop];
  });
  fn(...args);
});

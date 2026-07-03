module.exports = function asyncPipe(...fns) {
  return fns.reduceRight(
    function (next, fn) {
      return function (...args) {
        fn(...args, next);
      };
    },
    function () {},
  );
};

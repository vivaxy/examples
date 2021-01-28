/**
 * @since 2021-01-28 12:07
 * @author vivaxy
 */
function MyPromise(task) {
  let resolves = [];

  function triggerMicroTask(microTask) {
    setTimeout(function () {
      microTask(function (value) {
        while (resolves.length) {
          value = resolves.shift()(value);
          if (value && value.__isMyPromise) {
            break;
          }
        }
        if (value && value.__isMyPromise) {
          // concat remaining resolves to next promise
          while (resolves.length) {
            value.then(resolves.shift());
          }
        }
      });
    }, 0);
  }

  triggerMicroTask(task);

  return {
    then(resolve) {
      resolves.push(resolve);
      return this;
    },
    // to mark the promise object
    __isMyPromise: true,
  };
}

new MyPromise(function (resolve) {
  resolve(0);
})
  .then(function (value) {
    console.log(value);
    return new MyPromise(function (resolve) {
      resolve(1);
    });
  })
  .then(function (value) {
    console.log(value);
  })
  .then(function (value) {
    console.log(value);
  });

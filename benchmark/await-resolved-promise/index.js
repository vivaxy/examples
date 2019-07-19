/**
 * @since 2019-07-19 14:13
 * @author vivaxy
 *
 * Call simple function. 7.964s
 * Call function await promise. 16.687s
 * Call function with if logic. 9.612s
 */
let resolved = false;

function request() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(true);
    }, 1000);
  });
}

const promise = request();

async function callSimpleFunction() {
  return 0;
}

async function callFunctionWithAwaitPromise() {
  await promise;
  return 0;
}

async function callFunctionWithIfLogic() {
  if (resolved) {
    return 0;
  }
  await promise;
  return 0;
}

function getTime(s) {
  return (Date.now() - s) / 1000 + 's';
}

(async function() {
  await promise;
  resolved = true;

  const loopCount = 1e8;

  let s = Date.now();
  for (let i = 0; i < loopCount; i++) {
    await callSimpleFunction();
  }
  console.log('Call simple function.', getTime(s));

  s = Date.now();
  for (let i = 0; i < loopCount; i++) {
    await callFunctionWithAwaitPromise();
  }
  console.log('Call function await promise.', getTime(s));

  s = Date.now();
  for (let i = 0; i < loopCount; i++) {
    await callFunctionWithIfLogic();
  }
  console.log('Call function with if logic.', getTime(s));
})();

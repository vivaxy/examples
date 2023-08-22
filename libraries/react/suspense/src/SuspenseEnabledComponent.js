/**
 * @since 2023-08-22
 * @author vivaxy
 */
import { useState } from 'react';

const STATES = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
};

function makeSuspensePromise(promise) {
  promise._state = promise._state || STATES.PENDING;

  promise
    .then(function (result) {
      promise._result = result;
      promise._state = STATES.RESOLVED;
    })
    .catch(function (reason) {
      promise._result = reason;
      promise._state = STATES.REJECTED;
    });

  if (promise._state === STATES.PENDING) {
    throw promise;
  } else if (promise._state === STATES.RESOLVED) {
    return promise._result;
  } else if (promise._state === STATES.REJECTED) {
    throw promise._result;
  }
}

function createResolvedPromise() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('ok');
    }, 3000);
  });
}

let promise = createResolvedPromise();

export default function SuspenseEnabledComponent() {
  const result = makeSuspensePromise(promise);
  const [forceRenderCount, setForceRenderCount] = useState(0);

  function forceRender() {
    setForceRenderCount(forceRenderCount + 1);
  }

  function suspenseThenResolve() {
    promise = createResolvedPromise();
    forceRender();
  }

  function suspenseThenReject() {
    promise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject(new Error('not-ok'));
      }, 3000);
    });
    forceRender();
  }

  return (
    <div>
      <h1>SuspenseEnabledComponent</h1>
      <div>Result: {result}</div>
      <button onClick={suspenseThenResolve}>Suspense then resolve.</button>
      <button onClick={suspenseThenReject}>Suspense then reject.</button>
    </div>
  );
}

/**
 * @since 150508 13:28
 * @author vivaxy
 */
var promiseCount = 0,
  testPromise = function () {
    var thisPromiseCount = ++promiseCount,
      log = document.getElementById('log');
    log.insertAdjacentHTML(
      'beforeend',
      thisPromiseCount + ') Started (<small>Sync code started</small>)<br/>',
    );
    // We make a new promise: we promise the string 'result' (after waiting 3s)
    var p1 = new Promise(
      // The resolver function is called with the ability to resolve or
      // reject the promise
      function (resolve, reject) {
        log.insertAdjacentHTML(
          'beforeend',
          thisPromiseCount +
            ') Promise started (<small>Async code started</small>)<br/>',
        );
        // This only is an example to create asynchronism
        window.setTimeout(function () {
          // We fulfill the promise !
          resolve(thisPromiseCount);
        }, Math.random() * 2000 + 1000);
      },
    );
    // We define what to do when the promise is fulfilled
    p1.then(
      // Just log the message and a value
      function (val) {
        log.insertAdjacentHTML(
          'beforeend',
          val +
            ') Promise fulfilled (<small>Async code terminated</small>)<br/>',
        );
      },
    );
    log.insertAdjacentHTML(
      'beforeend',
      thisPromiseCount +
        ') Promise made (<small>Sync code terminated</small>)<br/>',
    );
  };

testPromise();

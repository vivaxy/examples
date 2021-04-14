/*
 * @author     : vivaxy
 * @date       : 2015-04-08 10:24:02
 * @modified by: vivaxy
 * @modified   : 2015-04-08 10:46:58
 */

'use strict';

window.addEventListener(
  'popstate',
  function (event) {
    console.log(event.state);
  },
  false,
);

// state object, title, url
history.pushState({ page: 'index' }, 'page index title', 'index.html');
history.pushState({ page: 'bar' }, 'page bar title', 'bar.html');

// history.back();
setTimeout(function () {
  history.go(-1);
  // log {page: "index"}
  setTimeout(function () {
    history.go(1);
    // log {page: "bar"}
  }, 1000);
}, 1000);

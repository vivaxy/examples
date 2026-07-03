const windowOnError = window.onerror;
window.onerror = function () {
  console.log('onerror', arguments);
  windowOnError && windowOnError.apply(window, arguments);
};

window.addEventListener(
  'error',
  function () {
    console.log('event listener error', arguments);
  },
  true,
);

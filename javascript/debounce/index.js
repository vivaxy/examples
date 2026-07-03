var myEfficientFn = debounceWithClearTimeout(function () {
  console.log('debounce');
}, 2000);

window.addEventListener('scroll', myEfficientFn);

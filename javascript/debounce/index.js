/**
 * @since 150628 11:09
 * @author vivaxy
 */
var myEfficientFn = debounceWithClearTimeout(function () {
    console.log('debounce');
}, 2000);

window.addEventListener('scroll', myEfficientFn);

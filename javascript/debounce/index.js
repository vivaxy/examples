/**
 * @since 150628 11:09
 * @author vivaxy
 */
var myEfficientFn = debounce(function () {
    console.log('debounce');
}, 2000);

window.addEventListener('scroll', myEfficientFn);

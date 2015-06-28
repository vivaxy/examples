/**
 * @since 150628 11:07
 * @author vivaxy
 */
/**
 * `func` will be executed in `wait` time after the final called on `debounce`
 * @param func - finally executed function
 * @param wait - time waited after finally called of `func` to execute `func`
 * @param immediate - ? 
 * @returns {Function}
 */
var debounce = function (func, wait, immediate) {

    var timeout;

    return function () {

        var context = this,
            args = arguments,

            later = function () {

                timeout = null;

                if (!immediate) func.apply(context, args);

            },

            callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);

    };

};

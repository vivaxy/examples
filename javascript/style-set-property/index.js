/**
 * @since 2017-02-12 09:48
 * @author vivaxy
 */

/**
 * @see https://sgom.es/posts/2017-02-10-bridging-css-and-js-with-custom-properties/
 *  custom variable is not applicable in IE
 *  @see http://caniuse.com/#feat=css-variables
 * @type {HTMLElement}
 */
var body = document.body;
// var animateElement = document.querySelector('.js-animate');
// animateElement.style.setProperty('width', '200px');

setTimeout(function() {
    body.style.setProperty('--width', '200px');
}, 0);

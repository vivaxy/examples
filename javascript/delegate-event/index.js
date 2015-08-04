/**
 * @since 15-08-04 13:57
 * @author vivaxy
 */
var containerElement = document.querySelector('.container');

delegateEvent('click', containerElement, '.box', function (e) {
    console.log(e);
});

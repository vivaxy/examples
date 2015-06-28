/**
 * @since 150628 13:09
 * @author vivaxy
 */
(function () {
    var p = Element.prototype;
    if (!p.matches) {
        p.matches = p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
                return ~Array.prototype.indexOf.call(document.querySelectorAll(s), this);
            };
    }
})();

//var matchesSelector = function (el, selector) {
//    var p = Element.prototype,
//        f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
//                return ~Array.prototype.indexOf.call(document.querySelectorAll(s), this);
//            };
//    return f.call(el, selector);
//};

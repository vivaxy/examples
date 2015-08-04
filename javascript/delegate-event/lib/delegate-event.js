/**
 * @since 15-08-04 14:05
 * @author vivaxy
 */
var delegateEvent = function (event, parent, selector, handler) {
    (function () {
        var p = Element.prototype;
        if (!p.matches) {
            p.matches = p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
                    return ~Array.prototype.indexOf.call(document.querySelectorAll(s), this);
                };
        }
    })();
    
    parent.addEventListener(event, function (e) {
        var path = e.path, i = 0, l = path.length;
        for (; i < l; i++) {
            var ele = path[i];
            if (ele === parent) {
                //break;
            } else if (ele.matches(selector)) {
                handler && handler(e);
                break;
            }
        }
    }, false);
};

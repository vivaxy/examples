/**
 * @since 150416 09:55
 * @author vivaxy
 */
var mixin = function (a, b) {
    var r = {};
    for (var i in a) {
        if (a.hasOwnProperty(i)) {
            r[i] = a[i];
        }
    }
    for (var j in b) {
        if (b.hasOwnProperty(j)) {
            r[j] = b[j];
        }
    }
    return r;
};

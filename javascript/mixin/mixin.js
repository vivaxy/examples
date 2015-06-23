/**
 * @since 150416 09:55
 * @author vivaxy
 */
var mixin = function () {
    var output = {};
    Array.prototype.forEach.call(arguments, function (object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                output[key] = object[key];
            }
        }
    });
    return output;
};

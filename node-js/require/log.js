/**
 * @since 15-08-26 11:35
 * @author vivaxy
 */
'use strict';
module.exports = function () {
    var args = arguments,
        date = new Date(),
        pad = function (number, length) {
            var numberString = number.toString(),
                paddingLength = length - numberString.length;
            for (var i = 0; i < paddingLength; i++) {
                numberString = '0' + numberString;
            }
            return numberString;
        },
        timestamp = '[' + pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2) + ':' + pad(date.getSeconds(), 2) + '.' + pad(date.getMilliseconds(), 3) + ']';
    Array.prototype.unshift.call(args, timestamp);
    console.log.apply(console, args);
};

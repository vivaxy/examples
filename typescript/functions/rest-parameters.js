/**
 * @since 2019-05-23 01:58
 * @author vivaxy
 */
function buildNameOfRestParameters(firstName) {
    var restOfName = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        restOfName[_i - 1] = arguments[_i];
    }
    return firstName + ' ' + restOfName.join(' ');
}

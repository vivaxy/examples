/**
 * @since 2019-05-21 06:55
 * @author vivaxy
 */
function addOfFunctionTypes(x, y) {
    return x + y;
}
var anotherAddOfFunctionTypes = function (x, y) {
    return x + y;
};
var addOfFunctionTypesSpec = function (x, theTypeIsInferred) {
    return x + theTypeIsInferred;
};

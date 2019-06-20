/**
 * @since 2019-06-20 16:38
 * @author vivaxy
 */
var EnumsAtRuntime;
(function (EnumsAtRuntime) {
    EnumsAtRuntime[EnumsAtRuntime["X"] = 0] = "X";
    EnumsAtRuntime[EnumsAtRuntime["Y"] = 1] = "Y";
    EnumsAtRuntime[EnumsAtRuntime["Z"] = 2] = "Z";
})(EnumsAtRuntime || (EnumsAtRuntime = {}));
function functionOfEnumsAtRuntime(obj) {
    return obj.X;
}
functionOfEnumsAtRuntime(EnumsAtRuntime);

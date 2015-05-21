/**
 * @since 150521 09:14
 * @author vivaxy
 */
var compile = function (functionObject) {
    return function (it) {
        return functionObject.toString().match(/\/\*([\s\S]*?)\*\//)[1].replace(/\$\{\w.+\}/g, function (variable) {
            var value = it;
            variable = variable.replace('${', '').replace('}', '');
            variable.split('.').forEach(function (section) {
                value = value[section];
            });
            return value;
        });
    }
};

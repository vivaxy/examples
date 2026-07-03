var compile = function (functionObject) {
  return function (scope) {
    return functionObject
      .toString()
      .match(/\/\*([\s\S]*?)\*\//)[1]
      .replace(/\$\{\w.+\}/g, function (variable) {
        var value = scope;
        variable = variable.replace('${', '').replace('}', '');
        variable.split('.').forEach(function (section) {
          value = value[section];
        });
        return value;
      });
  };
};

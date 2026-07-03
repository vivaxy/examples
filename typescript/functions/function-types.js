function addOfFunctionTypes(x, y) {
  return x + y;
}
var anotherAddOfFunctionTypes = function (x, y) {
  return x + y;
};
var addOfFunctionTypesSpec = function (x, theTypeIsInferred) {
  return x + theTypeIsInferred;
};

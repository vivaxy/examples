/**
 * @since 2019-05-21 06:55
 * @author vivaxy
 */
function addOfFunctionTypes(x: number, y: number): number {
  return x + y;
}

const anotherAddOfFunctionTypes = function(x: number, y: number): number {
  return x + y;
};

const addOfFunctionTypesSpec: (argumentNameCanBeDifferent: number, y: number) => number = function(
  x: number,
  theTypeIsInferred,
): number {
  return x + theTypeIsInferred;
};

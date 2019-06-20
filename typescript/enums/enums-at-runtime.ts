/**
 * @since 2019-06-20 16:38
 * @author vivaxy
 */
enum EnumsAtRuntime {
  X, Y, Z
}

function functionOfEnumsAtRuntime(obj: { X: number }) {
  return obj.X;
}

functionOfEnumsAtRuntime(EnumsAtRuntime);

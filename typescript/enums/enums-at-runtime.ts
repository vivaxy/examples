enum EnumsAtRuntime {
  X,
  Y,
  Z,
}

function functionOfEnumsAtRuntime(obj: { X: number }) {
  return obj.X;
}

functionOfEnumsAtRuntime(EnumsAtRuntime);

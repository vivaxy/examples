function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

function fail(): never {
  return error('Some error');
}

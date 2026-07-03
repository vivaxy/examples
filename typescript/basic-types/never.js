function error(message) {
  throw new Error(message);
}
function infiniteLoop() {
  while (true) {}
}
function fail() {
  return error('Some error');
}

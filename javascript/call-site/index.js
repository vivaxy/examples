/**
 * @since 2020-06-03 11:27
 * @author vivaxy
 */
function getCallSites() {
  const _prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack;
  Error.prepareStackTrace = _prepareStackTrace;
  stack.shift();
  return stack;
}

function a() {
  b();
}

function b() {
  window.callSites = getCallSites();
  console.log(
    window.callSites.map(function(callSite) {
      return callSite.toString();
    }),
  );
}

a();

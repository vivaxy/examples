/**
 * @since 2020-06-03 11:27
 * @author vivaxy
 */
function getCallSites() {
  const _prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack;
  const stacks =
    typeof stack === 'string'
      ? stack.split('\n').map(function(s) {
          return s.trim();
        })
      : stack;
  Error.prepareStackTrace = _prepareStackTrace;
  stacks.shift();
  return stacks;
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

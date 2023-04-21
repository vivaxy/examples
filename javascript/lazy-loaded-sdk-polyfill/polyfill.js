/**
 * @since 2023-04-21
 * @author vivaxy
 */
const callHistory = [];

function createProxy(properties) {
  return new Proxy(() => {}, {
    apply(_, thisArg, args) {
      callHistory.push({
        properties,
        args,
      });
      return createProxy(properties);
    },
    get(_, property) {
      if (property === 'callHistory') {
        return callHistory;
      }
      return createProxy([...properties, property]);
    },
  });
}

window.sdk = createProxy([]);

/**
 * @since 20190909 16:13
 * @author vivaxy
 */
export default function memorize(fn) {
  const map = new Map();
  return function(...args) {
    const serializedArgs = JSON.stringify(args);
    if (map.has(serializedArgs)) {
      return map.get(serializedArgs);
    }
    const ret = fn(...args);
    map.set(serializedArgs, ret);
    return ret;
  };
}

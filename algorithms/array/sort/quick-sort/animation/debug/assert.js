/**
 * @since 2018-05-26 11:19:38
 * @author vivaxy
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

window.assert = assert;

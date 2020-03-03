/**
 * @since 2020-03-03 03:27
 * @author vivaxy
 */
import fn from './type-and-interface';

function adaptor<T>(fn: T): T {
  return fn;
}

export default adaptor(fn);

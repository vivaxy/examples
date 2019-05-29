/**
 * @since 2019-05-29 10:56
 * @author vivaxy
 */

class GenericNumberOfGenericsClasses<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

const genericNumberOfGenericsClasses = new GenericNumberOfGenericsClasses<number>();
genericNumberOfGenericsClasses.zeroValue = 0;
genericNumberOfGenericsClasses.add = function(x, y) {
  return x + y;
};

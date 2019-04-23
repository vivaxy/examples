/**
 * @since 2019-04-23 12:47
 * @author vivaxy
 */
interface ISearchFunction {
  (source: string, subString: string): boolean;
}

const searchFunction: ISearchFunction = function(src: string, sub: string): boolean {
  const result = src.search(sub);
  return result > -1;
};

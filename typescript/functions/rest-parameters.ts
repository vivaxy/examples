/**
 * @since 2019-05-23 01:58
 * @author vivaxy
 */
function buildNameOfRestParameters(firstName: string, ...restOfName: string[]): string {
  return firstName + ' ' + restOfName.join(' ');
}

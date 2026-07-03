function buildNameOfRestParameters(
  firstName: string,
  ...restOfName: string[]
): string {
  return firstName + ' ' + restOfName.join(' ');
}

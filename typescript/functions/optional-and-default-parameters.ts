/**
 * @since 2019-05-21 08:03
 * @author vivaxy
 */

function buildNameOfOptionalParameters(firstName: string, lastName?: string): string {
  if (lastName) {
    return firstName + ' ' + lastName;
  } else {
    return firstName;
  }
}

function buildNameOfDefaultParameters(firstName: string, lastName: string = 'Smith'): string {
  return firstName + lastName;
}

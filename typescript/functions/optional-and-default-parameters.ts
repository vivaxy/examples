function buildNameOfOptionalParameters(
  firstName: string,
  lastName?: string,
): string {
  if (lastName) {
    return firstName + ' ' + lastName;
  } else {
    return firstName;
  }
}

function buildNameOfDefaultParameters(
  firstName: string,
  lastName: string = 'Smith',
): string {
  return firstName + lastName;
}

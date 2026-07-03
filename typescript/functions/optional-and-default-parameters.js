function buildNameOfOptionalParameters(firstName, lastName) {
  if (lastName) {
    return firstName + ' ' + lastName;
  } else {
    return firstName;
  }
}
function buildNameOfDefaultParameters(firstName, lastName) {
  if (lastName === void 0) {
    lastName = 'Smith';
  }
  return firstName + lastName;
}

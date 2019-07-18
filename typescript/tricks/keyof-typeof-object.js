'use strict';
var objectOfKeyofTypeofObject = {
  name: 'name',
  age: 'age',
};
function getValueFromObject1(key) {
  return objectOfKeyofTypeofObject[key];
}
function getValueFrom(obj, key) {
  return obj[key];
}
function getValue(obj, key) {
  return obj[key];
}
function log(largeObject) {
  console.log(largeObject);
}
var largeObject = {
  key: '0',
};
log(largeObject);

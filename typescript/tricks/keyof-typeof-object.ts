const objectOfKeyofTypeofObject = {
  name: 'name',
  age: 'age',
};

function getValueFromObject1(key: keyof typeof objectOfKeyofTypeofObject) {
  return objectOfKeyofTypeofObject[key];
}

function getValueFrom<T>(obj: T, key: keyof T) {
  return obj[key];
}

function getValue<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

// error
interface SomeObject {
  key: string;
}

function log(input: SomeObject) {
  console.log(input);
}

// any by passing function parameter type check, why?
const someObject: any = {
  key: 0,
};

log(someObject);

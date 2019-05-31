/**
 * @since 2019-05-31 17:17
 * @author vivaxy
 */

interface LengthwiseOfGenericsConstraints {
  length: number;
}

function loggingIdentityOfGenericsConstraints<T extends LengthwiseOfGenericsConstraints>(arg: T): T {
  console.log(arg.length);
  return arg;
}

function getPropertyOfGenericsConstraints<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getPropertyOfGenericsConstraints(x, 'a'); // okay

class ZooKeeper {
  nameTag: string;
}

class Animal {
  numLegs: number;
}

class Lion extends Animal {
  keeper: ZooKeeper;
}

function createInstance<A extends Animal>(c: { new(): A; }): A {
  return new c();
}

function createInstance1<A extends Animal>(c: new() => A): A {
  return new c();
}

createInstance(Lion).keeper.nameTag;
createInstance1(Lion).keeper.nameTag;

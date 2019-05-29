/**
 * @since 2019-05-28 17:10
 * @author vivaxy
 */

function identityOfGenerics<T>(arg: T): T {
  return arg;
}

const outputOfGenerics = identityOfGenerics<string>('myString');
const outputOfGenericsImplicity = identityOfGenerics('myString');

const identityOfGenericsFunctionInterface: <U>(arg: U) => U = (arg) => {
  return arg;
};

const identityOfGenericsObjectLiteral: { <T>(arg: T): T } = (arg) => {
  return arg;
};

interface IdentityOfGenerics {
  <T>(arg: T): T;
}

const identityOfGenericsInterface: IdentityOfGenerics = (arg) => {						// 函数 interface 的声明方式
  return arg;
};

interface IdentityOfGenericsWithGenerics<T> {
  (arg: T): T;
}

const identityOfGenericsInterfaceWithGenerics: IdentityOfGenericsWithGenerics<number> = (arg) => {						// 函数 interface 的声明方式
  return arg;
};

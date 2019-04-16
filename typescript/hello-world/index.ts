/**
 * @since 2019-04-16 15:05
 * @author vivaxy
 * @see https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
 */

function greeter(person: string): string {
  return 'Hello, ' + person;
}

let user: string = 'Jane User';
console.log(greeter(user));

interface Person {
  firstName: string,
  lastName: string,
}

function greeter2(person: Person): string {
  return 'Hello, ' + person.firstName + ' ' + person.lastName;
}

let user2 = { firstName: 'Jane', lastName: 'User' };
console.log(greeter2(user2));

class Student {
  fullName: string;
  constructor(public firstName: string, public middleInitial: string, public lastName: string) {
    this.fullName = firstName + ' ' + middleInitial + ' ' + lastName;
  }
}

let user3 = new Student('Jane', 'M.', 'User');
console.log(greeter2(user3))

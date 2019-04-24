/**
 * @since 2019-04-24 10:16
 * @author vivaxy
 */

class Person {
  #phoneNumber = null;

  constructor(name, phoneNumber) {
    this.name = name;
    this.#phoneNumber = phoneNumber;
  }

  getPhoneNumber() {
    return this.#phoneNumber;
  }
}

const bob = new Person('Bob', '1234')
console.log(bob.name);
console.log(bob.getPhoneNumber());
// console.log(bob.#phoneNumber);

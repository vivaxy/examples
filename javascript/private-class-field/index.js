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

const bob = new Person('Bob', '1234');
console.log(bob.name);
console.log(bob.getPhoneNumber());
// console.log(bob.#phoneNumber);

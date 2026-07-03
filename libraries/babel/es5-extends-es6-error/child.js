const Parent = require('./parent.js');

class Child extends Parent {
  constructor() {
    super();
  }
}

console.log(new Child());

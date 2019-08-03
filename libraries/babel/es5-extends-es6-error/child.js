/**
 * @since 2019-07-30 16:15
 * @author vivaxy
 */
const Parent = require('./parent.js');

class Child extends Parent {
  constructor() {
    super();
  }
}

console.log(new Child());

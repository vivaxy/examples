/**
 * @since 2019-05-23 02:19
 * @author vivaxy
 */

function implicitlyThisOfThis() {
  // ERROR: 'this' implicitly has type 'any' because it does not have a type annotation.
  // console.log(this);
}

interface ManOfThis {
  name: string,

  sayName(this: ManOfThis): void
}

const manOfThis: ManOfThis = {
  name: 'Bob',
  sayName: function() {
    console.log(this.name);
  },
};

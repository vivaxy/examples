/**
 * @since 2019-05-23 02:19
 * @author vivaxy
 */
const manOfThis = {
  name: 'Alen',
  createSayName: function() {
    // --noImplicitThis
    // ERROR: 'this' implicitly has type 'any' because it does not have a type annotation.
    // return function() {
    return () => {
      console.log(this.name);
    };
  },
};

interface ManOfThis {
  name: string,
  createSayName(this: ManOfThis): (this: ManOfThis) => void
}

const manOfThisByInstance: ManOfThis = {
  name: 'Bob',
  createSayName: function() {
    return () => {
      console.log(this.name);
    }
  }
}

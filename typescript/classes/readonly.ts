/**
 * @since 2019-04-23 04:47
 * @author vivaxy
 */
class OctopusOfReadonly {
  readonly name: string;
  readonly numberOfLegs: number = 8;
  constructor(theName: string) {
    this.name = theName;
  }
}
let dad = new OctopusOfReadonly('Man with the 8 strong legs');
dad.name = 'Man with the 3-piece suit'; // Cannot assign to 'name' because it is a read-only property.

class OctopusOfReadonlyWithShorthand {
  readonly numberOfLegs: number = 8;
  constructor(readonly name: string) {
    // shorthand
  }
}
let dad2 = new OctopusOfReadonlyWithShorthand('Man with the 8 strong legs');
console.log(dad2.name);

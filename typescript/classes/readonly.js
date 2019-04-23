/**
 * @since 2019-04-23 04:47
 * @author vivaxy
 */
var OctopusOfReadonly = /** @class */ (function () {
    function OctopusOfReadonly(theName) {
        this.numberOfLegs = 8;
        this.name = theName;
    }
    return OctopusOfReadonly;
}());
var dad = new OctopusOfReadonly('Man with the 8 strong legs');
dad.name = 'Man with the 3-piece suit'; // Cannot assign to 'name' because it is a read-only property.
var OctopusOfReadonlyWithShorthand = /** @class */ (function () {
    function OctopusOfReadonlyWithShorthand(name) {
        this.name = name;
        this.numberOfLegs = 8;
        // shorthand
    }
    return OctopusOfReadonlyWithShorthand;
}());
var dad2 = new OctopusOfReadonlyWithShorthand('Man with the 8 strong legs');
console.log(dad2.name);

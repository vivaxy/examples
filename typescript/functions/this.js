/**
 * @since 2019-05-23 02:19
 * @author vivaxy
 */
var manOfThis = {
    name: 'Alen',
    createSayName: function () {
        var _this = this;
        // --noImplicitThis
        // ERROR: 'this' implicitly has type 'any' because it does not have a type annotation.
        // return function() {
        return function () {
            console.log(_this.name);
        };
    }
};
var manOfThisByInstance = {
    name: 'Bob',
    createSayName: function () {
        var _this = this;
        return function () {
            console.log(_this.name);
        };
    }
};

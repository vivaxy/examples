/**
 * @since 2019-04-23 05:04
 * @author vivaxy
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AnimalOfAbstractClasses = /** @class */ (function () {
    function AnimalOfAbstractClasses() {
    }
    AnimalOfAbstractClasses.prototype.move = function () {
        console.log("roaming the earth...");
    };
    return AnimalOfAbstractClasses;
}());
// Non-abstract class 'DogOfAbstractClasses' does not implement inherited abstract member 'eat' from class 'AnimalOfAbstractClasses'.
var DogOfAbstractClasses = /** @class */ (function (_super) {
    __extends(DogOfAbstractClasses, _super);
    function DogOfAbstractClasses() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DogOfAbstractClasses.prototype.makeSound = function () {
        console.log('bark');
    };
    return DogOfAbstractClasses;
}(AnimalOfAbstractClasses));
var dogOfAbstractClasses = new DogOfAbstractClasses();
dogOfAbstractClasses.move(); // ok
dogOfAbstractClasses.makeSound(); // ok
var animalOfAbstractClasses = new AnimalOfAbstractClasses(); // Cannot create an instance of an abstract class.

/**
 * @since 2019-04-23 11:08
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
var AnimalOfPrivate = /** @class */ (function () {
    function AnimalOfPrivate(theName) {
        this.name = theName;
    }
    return AnimalOfPrivate;
}());
new AnimalOfPrivate('Cat').name; // Property 'name' is private and only accessible within class 'Animal'.
var RhinoOfPrivate = /** @class */ (function (_super) {
    __extends(RhinoOfPrivate, _super);
    function RhinoOfPrivate() {
        return _super.call(this, 'Rhino') || this;
    }
    return RhinoOfPrivate;
}(AnimalOfPrivate));
var EmployeeOfPrivate = /** @class */ (function () {
    function EmployeeOfPrivate(theName) {
        this.name = theName;
    }
    return EmployeeOfPrivate;
}());
var animalOfPrivate = new AnimalOfPrivate('Goat');
var rhinoOfPrivate = new RhinoOfPrivate();
var employeeOfPrivate = new EmployeeOfPrivate('Bob');
animalOfPrivate = rhinoOfPrivate;
// Type 'Employee' is not assignable to type 'Animal'.
// Types have separate declarations of a private property 'name'.
animalOfPrivate = employeeOfPrivate;

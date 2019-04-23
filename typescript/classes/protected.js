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
/**
 * @since 2019-04-23 02:06
 * @author vivaxy
 */
var PersonOfProtected = /** @class */ (function () {
    function PersonOfProtected(name, department) {
        this.name = name;
        this.department = department;
    }
    return PersonOfProtected;
}());
var EmployeeOfProtected = /** @class */ (function (_super) {
    __extends(EmployeeOfProtected, _super);
    function EmployeeOfProtected(name, department) {
        return _super.call(this, name, department) || this;
    }
    EmployeeOfProtected.prototype.sayElevatorPitch = function () {
        console.log(this.name, this.department); // Property 'department' is private and only accessible within class 'Person'.
    };
    return EmployeeOfProtected;
}(PersonOfProtected));
var howard = new EmployeeOfProtected('Howard', 'Sales');
console.log(howard.sayElevatorPitch());
console.log(howard.name); // Property 'name' is protected and only accessible within class 'Person' and its subclasses.

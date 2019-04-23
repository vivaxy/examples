/**
 * @since 2019-04-23 04:59
 * @author vivaxy
 */
var EmployeeOfAccessors = /** @class */ (function () {
    function EmployeeOfAccessors() {
    }
    Object.defineProperty(EmployeeOfAccessors.prototype, "fullName", {
        get: function () {
            return this._fullName;
        },
        set: function (newName) {
            this._fullName = newName;
        },
        enumerable: true,
        configurable: true
    });
    return EmployeeOfAccessors;
}());
var employeeOfAccessors = new EmployeeOfAccessors();
employeeOfAccessors.fullName = 'Bob Smith';
if (employeeOfAccessors.fullName) {
    console.log(employeeOfAccessors.fullName);
}

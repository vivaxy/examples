/**
 * @since 2019-04-23 04:59
 * @author vivaxy
 */

class EmployeeOfAccessors {
  private _fullName: string;

  get fullName(): string {
    return this._fullName;
  }

  set fullName(newName: string) {
    this._fullName = newName;
  }
}

let employeeOfAccessors = new EmployeeOfAccessors();
employeeOfAccessors.fullName = 'Bob Smith';
if (employeeOfAccessors.fullName) {
  console.log(employeeOfAccessors.fullName);
}

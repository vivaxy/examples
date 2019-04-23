/**
 * @since 2019-04-23 02:06
 * @author vivaxy
 */
class PersonOfProtected {
  protected name: string;
  private department: string;
  constructor(name: string, department: string) {
    this.name = name;
    this.department = department;
  }
}

class EmployeeOfProtected extends PersonOfProtected {
  constructor(name: string, department: string) {
    super(name, department);
  }

  sayElevatorPitch() {
    console.log(this.name, this.department); // Property 'department' is private and only accessible within class 'Person'.
  }
}

let howard = new EmployeeOfProtected('Howard', 'Sales');
console.log(howard.sayElevatorPitch());
console.log(howard.name); // Property 'name' is protected and only accessible within class 'Person' and its subclasses.

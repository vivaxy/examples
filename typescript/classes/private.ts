/**
 * @since 2019-04-23 11:08
 * @author vivaxy
 */

class AnimalOfPrivate {
  private name: string;
  constructor(theName: string) {
    this.name = theName;
  }
}

new AnimalOfPrivate('Cat').name; // Property 'name' is private and only accessible within class 'Animal'.

class RhinoOfPrivate extends AnimalOfPrivate {
  constructor() {
    super('Rhino');
  }
}

class EmployeeOfPrivate {
  private name: string;
  constructor(theName: string) {
    this.name = theName;
  }
}

let animalOfPrivate = new AnimalOfPrivate('Goat');
let rhinoOfPrivate = new RhinoOfPrivate();
let employeeOfPrivate = new EmployeeOfPrivate('Bob');

animalOfPrivate = rhinoOfPrivate;
// Type 'Employee' is not assignable to type 'Animal'.
// Types have separate declarations of a private property 'name'.
animalOfPrivate = employeeOfPrivate;

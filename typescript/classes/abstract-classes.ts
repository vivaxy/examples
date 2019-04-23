/**
 * @since 2019-04-23 05:04
 * @author vivaxy
 */

abstract class AnimalOfAbstractClasses {
  abstract eat(): void;
  abstract makeSound(): void;
  move(): void {
      console.log("roaming the earth...");
  }
}

// Non-abstract class 'DogOfAbstractClasses' does not implement inherited abstract member 'eat' from class 'AnimalOfAbstractClasses'.
class DogOfAbstractClasses extends AnimalOfAbstractClasses {
  makeSound() {
    console.log('bark');
  }
}

const dogOfAbstractClasses = new DogOfAbstractClasses();
dogOfAbstractClasses.move(); // ok
dogOfAbstractClasses.makeSound(); // ok

const animalOfAbstractClasses = new AnimalOfAbstractClasses(); // Cannot create an instance of an abstract class.

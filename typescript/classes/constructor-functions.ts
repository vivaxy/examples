/**
 * @since 2019-04-23 07:05
 * @author vivaxy
 */
class GreeterOfConstructorFunctions {
  static standardGreeting = 'Hello, there';
  greeting: string;
  greet() {
    if (this.greeting) {
      return 'Hello, ' + this.greeting;
    } else {
      return GreeterOfConstructorFunctions.standardGreeting;
    }
  }
}

const greeterMaker: typeof GreeterOfConstructorFunctions = GreeterOfConstructorFunctions;
greeterMaker.standardGreeting = 'Hey there!';

const greeterOfConstructorFunctions: GreeterOfConstructorFunctions = new greeterMaker();
console.log(greeterOfConstructorFunctions.greet());

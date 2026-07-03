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

const greeterMaker: typeof GreeterOfConstructorFunctions =
  GreeterOfConstructorFunctions;
greeterMaker.standardGreeting = 'Hey there!';

const greeterOfConstructorFunctions: GreeterOfConstructorFunctions =
  new greeterMaker();
console.log(greeterOfConstructorFunctions.greet());

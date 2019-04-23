/**
 * @since 2019-04-23 05:17
 * @author vivaxy
 */
class GreeterOfClasses {
  greeting: string;
  constructor(message: string) {
      this.greeting = message;
  }
  greet() {
      return "Hello, " + this.greeting;
  }
}

let greeterOfClass: GreeterOfClasses;
greeterOfClass = new GreeterOfClasses("world");
console.log(greeterOfClass.greet());

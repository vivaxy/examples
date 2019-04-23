/**
 * @since 2019-04-23 07:05
 * @author vivaxy
 */
var GreeterOfConstructorFunctions = /** @class */ (function () {
    function GreeterOfConstructorFunctions() {
    }
    GreeterOfConstructorFunctions.prototype.greet = function () {
        if (this.greeting) {
            return 'Hello, ' + this.greeting;
        }
        else {
            return GreeterOfConstructorFunctions.standardGreeting;
        }
    };
    GreeterOfConstructorFunctions.standardGreeting = 'Hello, there';
    return GreeterOfConstructorFunctions;
}());
var greeterMaker = GreeterOfConstructorFunctions;
greeterMaker.standardGreeting = 'Hey there!';
var greeterOfConstructorFunctions = new greeterMaker();
console.log(greeterOfConstructorFunctions.greet());

/**
 * @since 2019-04-23 05:17
 * @author vivaxy
 */
var GreeterOfClasses = /** @class */ (function () {
    function GreeterOfClasses(message) {
        this.greeting = message;
    }
    GreeterOfClasses.prototype.greet = function () {
        return "Hello, " + this.greeting;
    };
    return GreeterOfClasses;
}());
var greeterOfClass;
greeterOfClass = new GreeterOfClasses("world");
console.log(greeterOfClass.greet());

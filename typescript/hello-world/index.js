/**
 * @since 2019-04-16 15:05
 * @author vivaxy
 * @see https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
 */
function greeter(person) {
    return 'Hello, ' + person;
}
var user = 'Jane User';
console.log(greeter(user));
function greeter2(person) {
    return 'Hello, ' + person.firstName + ' ' + person.lastName;
}
var user2 = { firstName: 'Jane', lastName: 'User' };
console.log(greeter2(user2));
var Student = /** @class */ (function () {
    function Student(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + ' ' + middleInitial + ' ' + lastName;
    }
    return Student;
}());
var user3 = new Student('Jane', 'M.', 'User');
console.log(greeter2(user3));

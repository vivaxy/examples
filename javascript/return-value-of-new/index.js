/**
 * @since 15-09-16 11:39
 * @author vivaxy
 */
var Class1 = function (name, age) {
    this.name = name;
    this.age = age;
    return {};
};
var class1 = new Class1('vivaxy', 25);
console.log('class1', class1);

var Class2 = function (name, age) {
    this.name = name;
    this.age = age;
    return '';
};
var class2 = new Class2('vivaxy', 25);
console.log('class2', class2);

var Class3 = function (name, age) {
    this.name = name;
    this.age = age;
    return [];
};
var class3 = new Class3('vivaxy', 25);
console.log('class3', class3);

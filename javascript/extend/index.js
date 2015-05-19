/**
 * @since 150409 16:32
 * @author vivaxy
 */
var Animal = function (name, age) {
    this.age = age;
    this.name = name;
};

Animal.prototype.grow = function () {
    this.age++;
};

var Human = function (name, age, sex) {
    Human.__super__.constructor.apply(this, arguments);
    this.sex = sex;
};

extend(Human, Animal);


var human = new Human('jack', 1, 'male');

human.grow();

console.log(human.age);
console.log(human.sex);

/**
 * @since 150628 19:46
 * @author vivaxy
 */

var Animal = function (name, age) {
    this.name = name;
    this.age = age;
};
Animal.prototype.move = function () {
    console.log('moving');
};
Animal.prototype.grow = function () {
    this.age++;
    console.log(this.name + '\'s age is ' + this.age);
};

var animal = new Animal('cat', 12);
animal.move();
animal.grow();
console.log('animal instanceof Animal', animal instanceof Animal);

var Human = function (name, age, job) {
    this.job = job;
};
Human = extend(Animal, Human, {
    work: function () {
        console.log('working in ' + this.job);
    }
});

var human = new Human('human', 20, 'science');
human.work();
human.grow();
console.log('human instanceof People', human instanceof Human);
console.log('human instanceof Animal', human instanceof Animal); // todo fail!!!!

var Male = function (name, age, job) {
    this.sex = 'male';
};
Male = extend(Human, Male, {
    say: function () {
        console.log('i am male');
    }
});

var male = new Male('male', 25, 'office');
male.say();

debugger;

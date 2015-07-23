/**
 * @since 150521 20:17
 * @author vivaxy
 */
class Base {
    constructor(id) {
        this.id = id;
        this.number = 0;
    }

    add(num) {
        this.number += num;
    }

    log() {
        console.log(this.number);
    }
}

class AddOne extends Base {
    constructor(id, name) {
        super(id);
        this.name = name;
    }

    add() {
        super.add(1);
    }

    log() {
        console.log(this.name + '\'s value is ' + this.number);
    }
}

var addOne = new AddOne(0, 'one');
addOne.add();
addOne.log();

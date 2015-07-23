/**
 * @since 150521 20:17
 * @author vivaxy
 */
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Base = (function () {
    function Base(id) {
        _classCallCheck(this, Base);

        this.id = id;
        this.number = 0;
    }

    _createClass(Base, [{
        key: 'add',
        value: function add(num) {
            this.number += num;
        }
    }, {
        key: 'log',
        value: function log() {
            console.log(this.number);
        }
    }]);

    return Base;
})();

var AddOne = (function (_Base) {
    _inherits(AddOne, _Base);

    function AddOne(id, name) {
        _classCallCheck(this, AddOne);

        _get(Object.getPrototypeOf(AddOne.prototype), 'constructor', this).call(this, id);
        this.name = name;
    }

    _createClass(AddOne, [{
        key: 'add',
        value: function add() {
            _get(Object.getPrototypeOf(AddOne.prototype), 'add', this).call(this, 1);
        }
    }, {
        key: 'log',
        value: function log() {
            console.log(this.name + '\'s value is ' + this.number);
        }
    }]);

    return AddOne;
})(Base);

var addOne = new AddOne(0, 'one');
addOne.add();
addOne.log();
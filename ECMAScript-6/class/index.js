var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};/**
 * @since 150521 20:17
 * @author vivaxy
 */
var Base = (function(){"use strict";var proto$0={};
    function Base(id) {
        this.id = id;
        this.number = 0;
    }DP$0(Base,"prototype",{"configurable":false,"enumerable":false,"writable":false});

    proto$0.add = function(num) {
        this.number += num;
    };

    proto$0.log = function() {
        console.log(this.number);
    };
MIXIN$0(Base.prototype,proto$0);proto$0=void 0;return Base;})();

var AddOne = (function(super$0){"use strict";var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;if(!PRS$0)MIXIN$0(AddOne, super$0);var proto$0={};
    function AddOne(id, name) {
        super$0.call(this, id);
        this.name = name;
    }if(super$0!==null)SP$0(AddOne,super$0);AddOne.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":AddOne,"configurable":true,"writable":true}});DP$0(AddOne,"prototype",{"configurable":false,"enumerable":false,"writable":false});

    proto$0.add = function() {
        super$0.prototype.add.call(this, 1);
    };

    proto$0.log = function() {
        console.log(this.name + '\'s value is ' + this.number);
    };
MIXIN$0(AddOne.prototype,proto$0);proto$0=void 0;return AddOne;})(Base);

var addOne = new AddOne(0, 'one');
addOne.add();
addOne.log();

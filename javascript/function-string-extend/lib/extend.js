/**
 * @since 150628 19:45
 * @author vivaxy
 */
'use strict';

var extend = function () {
    var mixin = function (child, prototype) {
            for (var method in prototype) {
                if (prototype.hasOwnProperty(method)) {
                    child[method] = prototype[method];
                }
            }
        },
        reg = /(function[\s\S]*?\()([\s\S]*?)(\)\s*\{\s*)([\s\S]*)(\s*\})/,
        functionArgumentIndex = 2,
        functionBodyIndex = 4,
        childFunctionBody = '',
        Parent = function () {

        };
    Array.prototype.forEach.call(arguments, function (arg) {
        if (typeof arg === 'function') { // constructor with prototype
            var Constructor = function () {
                },
                childFunction = reg.exec(arg.toString());
            childFunctionBody += childFunction[functionBodyIndex];
            var Child = new Function(childFunction[functionArgumentIndex], childFunctionBody);
            mixin(Constructor.prototype, Parent.prototype);
            Child.prototype = new Constructor();
            mixin(Child.prototype, arg.prototype);
            Parent = Child;
        } else if (typeof  arg === 'object') { // prototype methods
            mixin(Parent.prototype, arg);
        } else {
            throw 'argument type error: ' + typeof arg;
        }
    });
    return Parent;
};

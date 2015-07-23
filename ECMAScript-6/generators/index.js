/**
 * @since 150723 16:44
 * @author vivaxy
 */
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fibonacci = _defineProperty({}, Symbol.iterator, regeneratorRuntime.mark(function callee$0$0() {
    var pre, cur, temp;
    return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                pre = 0, cur = 1;

            case 1:
                temp = pre;

                pre = cur;
                cur += temp;
                context$1$0.next = 6;
                return cur;

            case 6:
                context$1$0.next = 1;
                break;

            case 8:
            case "end":
                return context$1$0.stop();
        }
    }, callee$0$0, this);
}));

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = fibonacci[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var n = _step.value;

        // truncate the sequence at 1000
        if (n > 1000) break;
        console.log(n);
    }
} catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
} finally {
    try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
        }
    } finally {
        if (_didIteratorError) {
            throw _iteratorError;
        }
    }
}
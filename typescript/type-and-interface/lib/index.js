"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @since 2020-03-03 03:27
 * @author vivaxy
 */
const type_and_interface_1 = require("./type-and-interface");
function adaptor(fn) {
    return fn;
}
exports.default = adaptor(type_and_interface_1.default);

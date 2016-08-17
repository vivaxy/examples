/**
 * @since 2016-08-17 09:25
 * @author vivaxy
 */

var createElement = function (tagName, style, props, attr) {
    var element = document.createElement(tagName);
    if (!style) {
        style = {};
    }
    Object.keys(style).forEach(function (styleKey) {
        element.style[styleKey] = style[styleKey];
    });
    if (!props) {
        props = {};
    }
    Object.keys(props).forEach(function (propKey) {
        element[propKey] = props[propKey];
    });
    if (!attr) {
        attr = {};
    }
    Object.keys(attr).forEach(function (attrKey) {
        element.setAttribute(attrKey, attr[attrKey]);
    });
    return element;
};

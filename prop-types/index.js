/**
 * @since 20180125 16:05
 * @author vivaxy
 */

const passWhenUndefined = (fn) => {
    return (props, propName) => {
        if (props[propName] !== undefined) {
            fn(props, propName);
        }
    }
};

const getIsRequired = (typeCheck) => {
    return (props, propName) => {
        if (props[propName] === undefined) {
            throw Error(`\`${propName}\` is required.`);
        }
        typeCheck(props, propName);
    }
};

const getPrimitiveType = (type) => {
    const check = passWhenUndefined((props, propName) => {
        if (typeof props[propName] !== type) {
            throw Error(`\`${propName}\` should be a ${type}.`);
        }
    });
    check.isRequired = getIsRequired(check);
    return check;
};

const string = getPrimitiveType('string');
const bool = getPrimitiveType('boolean');
const number = getPrimitiveType('number');
const func = getPrimitiveType('function');
const symbol = getPrimitiveType('symbol');

const object = passWhenUndefined((props, propName) => {
    if (!isObject(props[propName])) {
        throw Error(`\`${propName}\` should be a object.`);
    }
});
object.isRequired = getIsRequired(object);

const array = passWhenUndefined((props, propName) => {
    if (!Array.isArray(props[propName])) {
        throw Error(`\`${propName}\` should be a array.`);
    }
});
array.isRequired = getIsRequired(array);

const isObject = (value) => {
    return typeof value === 'object' && !Array.isArray(value);
};

const shape = (object) => {
    const shapeType = passWhenUndefined((props, propName) => {
        if (!isObject(props[propName])) {
            throw Error(`\`${propName}\` should be a object.`);
        }
        validate(object, props[propName]);
    });
    shapeType.isRequired = getIsRequired(shapeType);
    return shapeType;
};

const validate = (propTypes, target) => {
    Object.keys(propTypes).map((propTypeKey) => {
        return propTypes[propTypeKey](target, propTypeKey);
    });
    return target;
};

const PropTypes = { validate, string, bool, number, func, symbol, object, array, shape };
module.exports = PropTypes;

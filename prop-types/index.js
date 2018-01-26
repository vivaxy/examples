/**
 * @since 20180125 16:05
 * @author vivaxy
 */

const check = (propTypes, target) => {
    Object.keys(propTypes).map((propTypeKey) => {
        return propTypes[propTypeKey](target, propTypeKey);
    });
    return target;
};

const passWhenUndefined = (fn) => {
    return (props, propName) => {
        if (props[propName] !== undefined) {
            return fn(props, propName);
        }
    }
};

const getIsRequired = (typeCheck) => {
    return (props, propName) => {
        if (props[propName] === undefined) {
            throw Error(`\`${propName}\` is required.`);
        }
        return typeCheck(props, propName);
    }
};

const isObject = (value) => {
    return typeof value === 'object' && !Array.isArray(value);
};

const getPrimitiveType = (type) => {
    const checkType = passWhenUndefined((props, propName) => {
        if (typeof props[propName] !== type) {
            throw Error(`\`${propName}\` should be a ${type}.`);
        }
    });
    checkType.isRequired = getIsRequired(checkType);
    return checkType;
};

const string = getPrimitiveType('string');
const bool = getPrimitiveType('boolean');
const number = getPrimitiveType('number');
const func = getPrimitiveType('function');
const symbol = getPrimitiveType('symbol');

const getCompositionalType = (type, checker) => {
    const checkType = passWhenUndefined((props, propName) => {
        if (!checker(props, propName)) {
            throw Error(`\`${propName}\` should be an ${type}.`);
        }
    });
    checkType.isRequired = getIsRequired(checkType);
    return checkType;
};

const object = getCompositionalType('object', (props, propName) => {
    return isObject(props[propName]);
});
const array = getCompositionalType('array', (props, propName) => {
    return Array.isArray(props[propName]);
});

const any = passWhenUndefined((props, propName) => {});
any.isRequired = getIsRequired(any);

const shape = (object) => {
    const shapeType = passWhenUndefined((props, propName) => {
        if (!isObject(props[propName])) {
            throw Error(`\`${propName}\` should be an object.`);
        }
        return check(object, props[propName]);
    });
    shapeType.isRequired = getIsRequired(shapeType);
    return shapeType;
};

const instanceOf = (Constructor) => {
    const instanceOfType = passWhenUndefined((props, propName) => {
        if (!(props[propName] instanceof Constructor)) {
            throw Error(`\`${propName}\` should be an instance of ${Constructor.name}.`);
        }
    });
    instanceOfType.isRequired = getIsRequired(instanceOfType);
    return instanceOfType;
};

const oneOf = (values) => {
    const oneOfType = passWhenUndefined((props, propName) => {
        if (!values.includes(props[propName])) {
            throw Error(`\`${propName}\` should be one of ${values}.`);
        }
    });
    oneOfType.isRequired = getIsRequired(oneOfType);
    return oneOfType;
};

const oneOfType = (types) => {
    const oneOfTypeType = passWhenUndefined((props, propName) => {
        const passedType = types.find((type) => {
            try {
                type(props, propName);
                return true;
            } catch (e) {
            }
        });
        if (passedType === undefined) {
            throw Error(`\`${propName}\` should be one of type ${types}.`);
        }
    });
    oneOfTypeType.isRequired = getIsRequired(oneOfTypeType);
    return oneOfTypeType;
};

const arrayOfType = (type) => {
    const arrayOfTypeType = passWhenUndefined((props, propName) => {
        return props[propName].map((value, index) => {
            return type(props[propName], index);
        });
    });
    arrayOfTypeType.isRequired = getIsRequired(arrayOfTypeType);
    return arrayOfTypeType;
};

const PropTypes = {
    check,
    string,
    bool,
    number,
    func,
    symbol,
    object,
    array,
    shape,
    instanceOf,
    oneOf,
    oneOfType,
    arrayOfType,
    any,
};
module.exports = PropTypes;

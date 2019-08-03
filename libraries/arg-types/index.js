/**
 * @since 20180125 16:05
 * @author vivaxy
 */

const check = (argTypes, target) => {
  Object.keys(argTypes).map((argName) => {
    return argTypes[argName](target, argName);
  });
  return target;
};

const merge = (args, defaultArgs) => {
  if (!defaultArgs) {
    return args;
  }
  return Object.keys(defaultArgs).reduce((reduced, key) => {
    const defaultValue = defaultArgs[key];
    if (isObject(defaultValue)) {
      return { ...reduced, [key]: merge(args[key], defaultArgs[key]) };
    }
    return { ...reduced, [key]: defaultValue };
  }, args);
};

const passWhenUndefined = (fn) => {
  return (args, argName) => {
    if (args[argName] !== undefined) {
      return fn(args, argName);
    }
  };
};

const getIsRequired = (typeCheck) => {
  return (args, argName) => {
    if (args[argName] === undefined) {
      throw Error(`\`${argName}\` is required.`);
    }
    return typeCheck(args, argName);
  };
};

const isObject = (value) => {
  return typeof value === 'object' && !Array.isArray(value);
};

const getPrimitiveType = (type) => {
  const checkType = passWhenUndefined((args, argName) => {
    if (typeof args[argName] !== type) {
      throw Error(`\`${argName}\` should be a ${type}.`);
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
  const checkType = passWhenUndefined((args, argName) => {
    if (!checker(args, argName)) {
      throw Error(`\`${argName}\` should be an ${type}.`);
    }
  });
  checkType.isRequired = getIsRequired(checkType);
  return checkType;
};

const object = getCompositionalType('object', (args, argName) => {
  return isObject(args[argName]);
});
const array = getCompositionalType('array', (args, argName) => {
  return Array.isArray(args[argName]);
});

const any = passWhenUndefined(() => {});
any.isRequired = getIsRequired(any);

const shape = (object) => {
  const shapeType = passWhenUndefined((args, argName) => {
    if (!isObject(args[argName])) {
      throw Error(`\`${argName}\` should be an object.`);
    }
    return check(object, args[argName]);
  });
  shapeType.isRequired = getIsRequired(shapeType);
  return shapeType;
};

const instanceOf = (Constructor) => {
  const instanceOfType = passWhenUndefined((args, argName) => {
    if (!(args[argName] instanceof Constructor)) {
      throw Error(
        `\`${argName}\` should be an instance of ${Constructor.name}.`,
      );
    }
  });
  instanceOfType.isRequired = getIsRequired(instanceOfType);
  return instanceOfType;
};

const oneOf = (values) => {
  const oneOfType = passWhenUndefined((args, argName) => {
    if (!values.includes(args[argName])) {
      throw Error(`\`${argName}\` should be one of ${values}.`);
    }
  });
  oneOfType.isRequired = getIsRequired(oneOfType);
  return oneOfType;
};

const oneOfType = (types) => {
  const oneOfTypeType = passWhenUndefined((args, argName) => {
    const passedType = types.find((type) => {
      try {
        type(args, argName);
        return true;
      } catch (e) {}
    });
    if (passedType === undefined) {
      throw Error(`\`${argName}\` should be one of type ${types}.`);
    }
  });
  oneOfTypeType.isRequired = getIsRequired(oneOfTypeType);
  return oneOfTypeType;
};

const arrayOfType = (type) => {
  const arrayOfTypeType = passWhenUndefined((args, argName) => {
    return args[argName].map((value, index) => {
      return type(args[argName], index);
    });
  });
  arrayOfTypeType.isRequired = getIsRequired(arrayOfTypeType);
  return arrayOfTypeType;
};

module.exports = {
  check,
  merge,
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

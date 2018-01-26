/**
 * @since 20180125 16:06
 * @author vivaxy
 */

const test = require('ava');
const PropTypes = require('..');

class Message {

}

const propTypes = {
    string: PropTypes.string,
    requiredString: PropTypes.string.isRequired,
    bool: PropTypes.bool,
    requiredBool: PropTypes.bool.isRequired,
    number: PropTypes.number,
    requiredNumber: PropTypes.number.isRequired,
    symbol: PropTypes.symbol,
    requiredSymbol: PropTypes.symbol.isRequired,
    func: PropTypes.func,
    requiredFunc: PropTypes.func.isRequired,
    object: PropTypes.object,
    requiredObject: PropTypes.object.isRequired,
    array: PropTypes.array,
    requiredArray: PropTypes.array.isRequired,
    shape: PropTypes.shape({}),
    requiredShape: PropTypes.shape({
        requiredNumber: PropTypes.number.isRequired,
    }).isRequired,
    instanceOf: PropTypes.instanceOf(Message),
    requiredInstanceOf: PropTypes.instanceOf(Message).isRequired,
    oneOf: PropTypes.oneOf([1, 2]),
    requiredOneOf: PropTypes.oneOf([1, 2]).isRequired,
    oneOfType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    requiredOneOfType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    arrayOfType: PropTypes.arrayOfType(PropTypes.number),
    requiredArrayOfType: PropTypes.arrayOfType(PropTypes.number).isRequired,
    any: PropTypes.any,
    requiredAny: PropTypes.any.isRequired,
    custom: (props, propName) => {
        if (props[propName] !== 'custom') {
            throw new Error('Custom Error');
        }
    },
};
const object = {
    string: '1',
    requiredString: '1',
    bool: true,
    requiredBool: true,
    number: 1,
    requiredNumber: 1,
    symbol: Symbol(1),
    requiredSymbol: Symbol(1),
    func: () => {

    },
    requiredFunc: () => {

    },
    object: {},
    requiredObject: {},
    array: [],
    requiredArray: [],
    shape: {},
    requiredShape: {
        requiredNumber: 1,
    },
    instanceOf: new Message(),
    requiredInstanceOf: new Message(),
    oneOf: 1,
    requiredOneOf: 1,
    oneOfType: '1',
    requiredOneOfType: '1',
    arrayOfType: [1],
    requiredArrayOfType: [1],
    any: 1,
    requiredAny: 1,
    custom: 'custom',
};

test('pass', (t) => {
    t.notThrows(() => {
        PropTypes.check(propTypes, object);
    });
});

test('pass on optional string, not provided', (t) => {
    t.notThrows(() => {
        const { string, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional string, number type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, string: 1 });
    }, Error);
});

test('throw on required string, not provided', (t) => {
    t.throws(() => {
        const { requiredString, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required string, number type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredString: 1 });
    }, Error);
});

test('pass on optional boolean, not provided', (t) => {
    t.notThrows(() => {
        const { bool, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional bool, number type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, bool: 1 });
    }, Error);
});

test('throw on required boolean, not provided', (t) => {
    t.throws(() => {
        const { requiredBool, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required boolean, number type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredBool: 1 });
    }, Error);
});

test('pass on optional number, not provided', (t) => {
    t.notThrows(() => {
        const { number, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional number, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, number: '1' });
    }, Error);
});

test('throw on required number, not provided', (t) => {
    t.throws(() => {
        const { requiredNumber, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required number, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredNumber: '1' });
    }, Error);
});

test('pass on optional symbol, not provided', (t) => {
    t.notThrows(() => {
        const { symbol, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional symbol, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, symbol: '1' });
    }, Error);
});

test('throw on required symbol, not provided', (t) => {
    t.throws(() => {
        const { requiredSymbol, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required number, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredSymbol: '1' });
    }, Error);
});

test('pass on optional function, not provided', (t) => {
    t.notThrows(() => {
        const { func, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional function, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, func: '1' });
    }, Error);
});

test('throw on required function, not provided', (t) => {
    t.throws(() => {
        const { requiredFunc, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required function, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredFunc: '1' });
    }, Error);
});

test('pass on optional object, not provided', (t) => {
    t.notThrows(() => {
        const { object: _, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional object, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, object: '1' });
    }, Error);
});

test('throw on required object, not provided', (t) => {
    t.throws(() => {
        const { requiredObject, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required object, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredObject: '1' });
    }, Error);
});

test('pass on optional array, not provided', (t) => {
    t.notThrows(() => {
        const { array, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on optional array, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, array: '1' });
    }, Error);
});

test('throw on required array, not provided', (t) => {
    t.throws(() => {
        const { requiredArray, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required array, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredArray: '1' });
    }, Error);
});

test('pass on optional shape, not provided', (t) => {
    t.notThrows(() => {
        const { shape, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on optional shape, number type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, shape: 1 });
    }, Error);
});

test('throws on optional shape, array type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, shape: [] });
    }, Error);
});

test('throws on required shape, not provided', (t) => {
    t.throws(() => {
        const { requiredShape, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required shape, nested type, required number, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredShape: { requiredNumber: '1' } });
    }, Error);
});

test('pass on optional instanceOf, not provided', (t) => {
    t.notThrows(() => {
        const { instanceOf, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on optional instanceOf, number type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, instanceOf: 1 });
    }, Error);
});

test('throws on required instanceOf, not provided', (t) => {
    t.throws(() => {
        const { requiredInstanceOf, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required instanceOf, string type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredInstanceOf: '1' });
    }, Error);
});

test('pass on optional oneOf, not provided', (t) => {
    t.notThrows(() => {
        const { oneOf, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on optional oneOf, not included value', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, oneOf: 3 });
    }, Error);
});

test('throws on required oneOf, not provided', (t) => {
    t.throws(() => {
        const { requiredOneOf, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required oneOf, not included value', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredOneOf: 3 });
    }, Error);
});

test('pass on optional oneOfType, not provided', (t) => {
    t.notThrows(() => {
        const { oneOfType, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on optional oneOfType, not included type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, oneOfType: {} });
    }, Error);
});

test('throws on required oneOfType, not provided', (t) => {
    t.throws(() => {
        const { requiredOneOfType, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required oneOfType, not included type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredOneOfType: {} });
    }, Error);
});

test('pass on optional arrayOfType, not provided', (t) => {
    t.notThrows(() => {
        const { arrayOfType, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on optional arrayOfType, not included type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, arrayOfType: [1, '2'] });
    }, Error);
});

test('throws on required arrayOfType, not provided', (t) => {
    t.throws(() => {
        const { requiredArrayOfType, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required arrayOfType, not included type', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { ...object, requiredArrayOfType: [1, '2'] });
    }, Error);
});

test('pass on optional any, not provided', (t) => {
    t.notThrows(() => {
        const { any, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throws on required any, not provided', (t) => {
    t.throws(() => {
        const { requiredAny, ...rest } = object;
        PropTypes.check(propTypes, rest);
    }, Error);
});

test('throw on custom props, not passed', (t) => {
    t.throws(() => {
        PropTypes.check(propTypes, { object, custom: 1 });
    }, Error);
});

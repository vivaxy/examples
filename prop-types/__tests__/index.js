/**
 * @since 20180125 16:06
 * @author vivaxy
 */

const test = require('ava');
const PropTypes = require('..');

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
    custom: 'custom',
};

test('pass', (t) => {
    t.notThrows(() => {
        PropTypes.validate(propTypes, object);
    });
});

test('pass on optional string, not provided', (t) => {
    t.notThrows(() => {
        const { string, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional string, number type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, string: 1 });
    }, Error);
});

test('throw on required string, not provided', (t) => {
    t.throws(() => {
        const { requiredString, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required string, number type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredString: 1 });
    }, Error);
});

test('pass on optional boolean, not provided', (t) => {
    t.notThrows(() => {
        const { bool, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional bool, number type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, bool: 1 });
    }, Error);
});

test('throw on required boolean, not provided', (t) => {
    t.throws(() => {
        const { requiredBool, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required boolean, number type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredBool: 1 });
    }, Error);
});

test('pass on optional number, not provided', (t) => {
    t.notThrows(() => {
        const { number, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional number, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, number: '1' });
    }, Error);
});

test('throw on required number, not provided', (t) => {
    t.throws(() => {
        const { requiredNumber, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required number, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredNumber: '1' });
    }, Error);
});

test('pass on optional symbol, not provided', (t) => {
    t.notThrows(() => {
        const { symbol, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional symbol, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, symbol: '1' });
    }, Error);
});

test('throw on required symbol, not provided', (t) => {
    t.throws(() => {
        const { requiredSymbol, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required number, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredSymbol: '1' });
    }, Error);
});

test('pass on optional function, not provided', (t) => {
    t.notThrows(() => {
        const { func, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional function, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, func: '1' });
    }, Error);
});

test('throw on required function, not provided', (t) => {
    t.throws(() => {
        const { requiredFunc, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required function, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredFunc: '1' });
    }, Error);
});

test('pass on optional object, not provided', (t) => {
    t.notThrows(() => {
        const { object: _, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional object, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, object: '1' });
    }, Error);
});

test('throw on required object, not provided', (t) => {
    t.throws(() => {
        const { requiredObject, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required object, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredObject: '1' });
    }, Error);
});

test('pass on optional array, not provided', (t) => {
    t.notThrows(() => {
        const { array, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throw on optional array, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, array: '1' });
    }, Error);
});

test('throw on required array, not provided', (t) => {
    t.throws(() => {
        const { requiredArray, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required array, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredArray: '1' });
    }, Error);
});

test('pass on optional shape, not provided', (t) => {
    t.notThrows(() => {
        const { shape, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on optional shape, number type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, shape: 1 });
    }, Error);
});

test('throws on optional shape, array type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, shape: [] });
    }, Error);
});

test('throws on required shape, not provided', (t) => {
    t.throws(() => {
        const { requiredShape, ...rest } = object;
        PropTypes.validate(propTypes, rest);
    }, Error);
});

test('throws on required shape, nested type, required number, string type', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { ...object, requiredShape: { requiredNumber: '1' } });
    }, Error);
});

test('throw on custom props, not passed', (t) => {
    t.throws(() => {
        PropTypes.validate(propTypes, { object, custom: 1 });
    }, Error);
});

/**
 * @since 20180125 16:06
 * @author vivaxy
 */

const test = require('ava');
const ArgTypes = require('..');

class Message {

}

const argTypes = {
    string: ArgTypes.string,
    requiredString: ArgTypes.string.isRequired,
    bool: ArgTypes.bool,
    requiredBool: ArgTypes.bool.isRequired,
    number: ArgTypes.number,
    requiredNumber: ArgTypes.number.isRequired,
    symbol: ArgTypes.symbol,
    requiredSymbol: ArgTypes.symbol.isRequired,
    func: ArgTypes.func,
    requiredFunc: ArgTypes.func.isRequired,
    object: ArgTypes.object,
    requiredObject: ArgTypes.object.isRequired,
    array: ArgTypes.array,
    requiredArray: ArgTypes.array.isRequired,
    shape: ArgTypes.shape({}),
    requiredShape: ArgTypes.shape({
        requiredNumber: ArgTypes.number.isRequired,
    }).isRequired,
    instanceOf: ArgTypes.instanceOf(Message),
    requiredInstanceOf: ArgTypes.instanceOf(Message).isRequired,
    oneOf: ArgTypes.oneOf([1, 2]),
    requiredOneOf: ArgTypes.oneOf([1, 2]).isRequired,
    oneOfType: ArgTypes.oneOfType([
        ArgTypes.string,
        ArgTypes.number,
    ]),
    requiredOneOfType: ArgTypes.oneOfType([
        ArgTypes.string,
        ArgTypes.number,
    ]).isRequired,
    arrayOfType: ArgTypes.arrayOfType(ArgTypes.number),
    requiredArrayOfType: ArgTypes.arrayOfType(ArgTypes.number).isRequired,
    any: ArgTypes.any,
    requiredAny: ArgTypes.any.isRequired,
    custom: (args, argName) => {
        if (args[argName] !== 'custom') {
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
        ArgTypes.check(argTypes, object);
    });
});

test('pass on optional string, not provided', (t) => {
    t.notThrows(() => {
        const { string, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional string, number type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, string: 1 });
    }, Error);
});

test('throw on required string, not provided', (t) => {
    t.throws(() => {
        const { requiredString, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required string, number type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredString: 1 });
    }, Error);
});

test('pass on optional boolean, not provided', (t) => {
    t.notThrows(() => {
        const { bool, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional bool, number type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, bool: 1 });
    }, Error);
});

test('throw on required boolean, not provided', (t) => {
    t.throws(() => {
        const { requiredBool, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required boolean, number type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredBool: 1 });
    }, Error);
});

test('pass on optional number, not provided', (t) => {
    t.notThrows(() => {
        const { number, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional number, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, number: '1' });
    }, Error);
});

test('throw on required number, not provided', (t) => {
    t.throws(() => {
        const { requiredNumber, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required number, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredNumber: '1' });
    }, Error);
});

test('pass on optional symbol, not provided', (t) => {
    t.notThrows(() => {
        const { symbol, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional symbol, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, symbol: '1' });
    }, Error);
});

test('throw on required symbol, not provided', (t) => {
    t.throws(() => {
        const { requiredSymbol, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required number, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredSymbol: '1' });
    }, Error);
});

test('pass on optional function, not provided', (t) => {
    t.notThrows(() => {
        const { func, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional function, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, func: '1' });
    }, Error);
});

test('throw on required function, not provided', (t) => {
    t.throws(() => {
        const { requiredFunc, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required function, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredFunc: '1' });
    }, Error);
});

test('pass on optional object, not provided', (t) => {
    t.notThrows(() => {
        const { object: _, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional object, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, object: '1' });
    }, Error);
});

test('throw on required object, not provided', (t) => {
    t.throws(() => {
        const { requiredObject, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required object, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredObject: '1' });
    }, Error);
});

test('pass on optional array, not provided', (t) => {
    t.notThrows(() => {
        const { array, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on optional array, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, array: '1' });
    }, Error);
});

test('throw on required array, not provided', (t) => {
    t.throws(() => {
        const { requiredArray, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required array, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredArray: '1' });
    }, Error);
});

test('pass on optional shape, not provided', (t) => {
    t.notThrows(() => {
        const { shape, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on optional shape, number type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, shape: 1 });
    }, Error);
});

test('throws on optional shape, array type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, shape: [] });
    }, Error);
});

test('throws on required shape, not provided', (t) => {
    t.throws(() => {
        const { requiredShape, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required shape, nested type, required number, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredShape: { requiredNumber: '1' } });
    }, Error);
});

test('pass on optional instanceOf, not provided', (t) => {
    t.notThrows(() => {
        const { instanceOf, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on optional instanceOf, number type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, instanceOf: 1 });
    }, Error);
});

test('throws on required instanceOf, not provided', (t) => {
    t.throws(() => {
        const { requiredInstanceOf, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required instanceOf, string type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredInstanceOf: '1' });
    }, Error);
});

test('pass on optional oneOf, not provided', (t) => {
    t.notThrows(() => {
        const { oneOf, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on optional oneOf, not included value', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, oneOf: 3 });
    }, Error);
});

test('throws on required oneOf, not provided', (t) => {
    t.throws(() => {
        const { requiredOneOf, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required oneOf, not included value', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredOneOf: 3 });
    }, Error);
});

test('pass on optional oneOfType, not provided', (t) => {
    t.notThrows(() => {
        const { oneOfType, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on optional oneOfType, not included type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, oneOfType: {} });
    }, Error);
});

test('throws on required oneOfType, not provided', (t) => {
    t.throws(() => {
        const { requiredOneOfType, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required oneOfType, not included type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredOneOfType: {} });
    }, Error);
});

test('pass on optional arrayOfType, not provided', (t) => {
    t.notThrows(() => {
        const { arrayOfType, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on optional arrayOfType, not included type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, arrayOfType: [1, '2'] });
    }, Error);
});

test('throws on required arrayOfType, not provided', (t) => {
    t.throws(() => {
        const { requiredArrayOfType, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required arrayOfType, not included type', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { ...object, requiredArrayOfType: [1, '2'] });
    }, Error);
});

test('pass on optional any, not provided', (t) => {
    t.notThrows(() => {
        const { any, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throws on required any, not provided', (t) => {
    t.throws(() => {
        const { requiredAny, ...rest } = object;
        ArgTypes.check(argTypes, rest);
    }, Error);
});

test('throw on custom args, not passed', (t) => {
    t.throws(() => {
        ArgTypes.check(argTypes, { object, custom: 1 });
    }, Error);
});

test('merge first layer object', (t) => {
    t.deepEqual(ArgTypes.merge({ a: 1, b: 2 }, { c: 3 }), { a: 1, b: 2, c: 3 });
});

test('merge second layer object', (t) => {
    t.deepEqual(ArgTypes.merge({ a: 1, b: 2, deep: { e: 4, f: 5 } }, { c: 3, deep: { g: 6 } }), {
        a: 1, b: 2, c: 3, deep: {
            e: 4, f: 5, g: 6
        }
    });
});

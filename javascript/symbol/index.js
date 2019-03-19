/**
 * @since 2019-03-19 07:38:08
 * @author vivaxy
 */

// typeof
console.log('typeof Symbol() ===', typeof Symbol());

// symbol not equals
console.log('Symbol() === Symbol():', Symbol() === Symbol());
console.log('Symbol(\'not equals\') === Symbol(\'not equals\'):', Symbol('not equals') === Symbol('not equals'));

// symbol to string
console.log('Symbol(\'to-string)\').toString() ===', Symbol('to-string').toString());
console.log('Symbol(\'Symbol(to-string)\').toString() ===', Symbol('Symbol(to-string)').toString());

// symbol argument
const symbolArgument = {
  toString() {
    return 'symbolArgument';
  },
};
console.log('symbol argument:', Symbol(symbolArgument));

// toString
const symbolArgument2 = {
  toString() {
    return symbolArgument;
  },
};
try {
  Symbol(symbolArgument2);
} catch (e) {
  console.error('symbol argument:', e);
}

// symbol as object key
const symbolAsObjectKey = {
  [Symbol()]: 1,
};
console.log('symbol as object key:', Object.keys(symbolAsObjectKey), Object.getOwnPropertySymbols(symbolAsObjectKey));

// Symbol.for
console.log('Symbol.for(\'symbol.for\') === Symbol.for(\'symbol.for\'):', Symbol.for('symbol.for') === Symbol.for('symbol.for'));

// Symbol.keyFor
console.log('Symbol.keyFor(Symbol.for(\'key-for\')) ===', Symbol.keyFor(Symbol.for('key-for')));
console.log('Symbol.keyFor(Symbol()) ===', Symbol.keyFor(Symbol()));

// Symbol key shares within windows
const iframe = document.createElement('iframe');
iframe.src = './iframe.html';
document.body.appendChild(iframe);
console.log('iframe.contentWindow.Symbol.for(\'foo\') === window.Symbol.for(\'foo\'):', iframe.contentWindow.Symbol.for('foo') === window.Symbol.for('foo'));

// Symbol.hasInstance
const symbolHasInstance = {
  [Symbol.hasInstance](value) {
    console.log('hasInstance:', value);
    return true;
  },
};
console.log('Symbol.hasInstance:', null instanceof symbolHasInstance);

// Symbol.isConcatSpreadable
const symbolIsConcatSpreadable = [4, 5, 6];
symbolIsConcatSpreadable[Symbol.isConcatSpreadable] = false;
console.log('[1, 2, 3].concat(symbolIsConcatSpreadable) ===', [1, 2, 3].concat(symbolIsConcatSpreadable));

class SymbolIsConcatSpreadable extends Array {
  constructor(arg) {
    super(arg);
  }

  get [Symbol.isConcatSpreadable]() {
    return false;
  }
}

const symbolIsConcatSpreadable2 = new SymbolIsConcatSpreadable(['d', 'e', 'f']);
console.log('[\'a\', \'b\', \'c\'].concat(symbolIsConcatSpreadable2) ===', ['a', 'b', 'c'].concat(symbolIsConcatSpreadable2));

// Symbol.species
class SymbolSpeciesArray extends Array {
}

const symbolSpeciesArray = new SymbolSpeciesArray(1, 2, 3);
console.log('symbolSpeciesArray.map(x => x) instanceof SymbolSpeciesArray ===', symbolSpeciesArray.map(x => x) instanceof SymbolSpeciesArray);
console.log('symbolSpeciesArray.map(x => x) instanceof Array ===', symbolSpeciesArray.map(x => x) instanceof Array);

Object.defineProperty(SymbolSpeciesArray, Symbol.species, {
  get() {
    return Array;
  },
});
console.log('symbolSpeciesArray.map(x => x) instanceof SymbolSpeciesArray ===', symbolSpeciesArray.map(x => x) instanceof SymbolSpeciesArray);
console.log('symbolSpeciesArray.map(x => x) instanceof Array ===', symbolSpeciesArray.map(x => x) instanceof Array);

// Symbol.match
const symbolMatch = {
  [Symbol.match](string) {
    console.log('Symbol.match string:', string);
    return 'match!!!';
  },
};
console.log('\'match???\'.match(symbolMatch) ===', 'match???'.match(symbolMatch));

// Symbol.replace
const symbolReplace = {
  [Symbol.replace](string) {
    console.log('Symbol.replace string:', string);
    return 'replace!!!';
  },
};
console.log('\'replace???\'.replace(symbolReplace) ===', 'replace???'.replace(symbolReplace));

// Symbol.search
// omit

// Symbol.split
// omit

// Symbol.iterator
const symbolIterator = {
  * [Symbol.iterator](value) {
    console.log('Symbol.iterator value:', value);
    yield 's';
    yield 'y';
    yield 'm';
    yield 'b';
    yield 'o';
    yield 'l';
  },
};
console.log('[...symbolIterator] ===', [...symbolIterator]);

// Symbol.toPrimitive
const symbolToPrimitive = {
  [Symbol.toPrimitive](type) {
    console.log('Symbol.toPrimitive type:', type);
    switch (type) {
      case 'number':
        return Infinity;
      case 'string':
        return 'string';
      case 'default':
        return 'default';
      default:
        throw new Error('Unexpected type: ' + type);
    }
  },
};
console.log('String(symbolToPrimitive) ===', String(symbolToPrimitive));
console.log('Number(symbolToPrimitive) ===', Number(symbolToPrimitive));
console.log('Boolean(symbolToPrimitive) ===', Boolean(symbolToPrimitive));
console.log('+symbolToPrimitive ===', +symbolToPrimitive);
console.log('\'\' + symbolToPrimitive ===', '' + symbolToPrimitive);

// Symbol.toStringTag
console.log('{ [Symbol.toStringTag]: \'SymbolToStringTag\' }.toString() ===', { [Symbol.toStringTag]: 'SymbolToStringTag' }.toString());

class SymbolToStringTagClass {
  [Symbol.toStringTag] = 'SymbolToStringTagClass';
}

console.log('(new SymbolToStringTagClass()).toString() ===', (new SymbolToStringTagClass()).toString());
console.log('JSON[Symbol.toStringTag] ===', JSON[Symbol.toStringTag]);
console.log('Math[Symbol.toStringTag] ===', Math[Symbol.toStringTag]);
console.log('ArrayBuffer.prototype[Symbol.toStringTag] ===', ArrayBuffer.prototype[Symbol.toStringTag]);
console.log('DataView.prototype[Symbol.toStringTag] ===', DataView.prototype[Symbol.toStringTag]);
console.log('Map.prototype[Symbol.toStringTag] ===', Map.prototype[Symbol.toStringTag]);
console.log('Promise.prototype[Symbol.toStringTag] ===', Promise.prototype[Symbol.toStringTag]);
console.log('Set.prototype[Symbol.toStringTag] ===', Set.prototype[Symbol.toStringTag]);
console.log('WeakMap.prototype[Symbol.toStringTag] ===', WeakMap.prototype[Symbol.toStringTag]);
console.log('WeakSet.prototype[Symbol.toStringTag] ===', WeakSet.prototype[Symbol.toStringTag]);
console.log('Symbol.prototype[Symbol.toStringTag] ===', Symbol.prototype[Symbol.toStringTag]);
console.log('(function * () {}).prototype[Symbol.toStringTag] ===', (function* () {
}).prototype[Symbol.toStringTag]);
console.log('(function * () {}).constructor.prototype[Symbol.toStringTag] ===', (function* () {
}).constructor.prototype[Symbol.toStringTag]);

// Symbol.unscopables
const symbolUnscopable = {
  scope: 'scope',
  unscopabled: 'unscopabled',
  [Symbol.unscopables]: {
    unscopabled: true,
  },
};

with (symbolUnscopable) {
  console.log('scope ===', scope);
  try {
    console.log('unscopabled ===', unscopabled);
  } catch (e) {
    console.error(e);
  }
}

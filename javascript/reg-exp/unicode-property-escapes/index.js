const number = /^\p{Number}+$/u;
console.log(`${number}.test('²³¹¼½¾')`, number.test('²³¹¼½¾')); // true
console.log(`${number}.test('㉛㉜㉝')`, number.test('㉛㉜㉝')); // true
console.log(`${number}.test('ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ')`, number.test('ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ')); // true

const alphabetic = /^\p{Alphabetic}+$/u;
console.log(`${alphabetic}.test('漢字aè')`, alphabetic.test('漢字aè')); // true

const emoji = /\p{Emoji}/u;
console.log(`${emoji}.test('👽👾')`, emoji.test('👽👾')); // true

/**
 * @since 2023-12-21
 * @author vivaxy
 * @see https://www.freecodecamp.org/news/how-to-get-started-with-internationalization-in-javascript-c09a0d2cd834/
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#digit_options
 */

// Numeric systems
/**
 * @see https://402.ecma-international.org/9.0/#table-numbering-system-digits
 * @param {string|string[]} locals
 */
function printNumberFormat(locals) {
  console.log(
    locals,
    Intl.NumberFormat(locals, {
      useGrouping: false,
    }).format(1234567890),
  );
}

printNumberFormat('zh-u-nu-arab');
printNumberFormat('zh-u-nu-arabext');
printNumberFormat('zh-u-nu-bali');
printNumberFormat('zh-u-nu-beng');
printNumberFormat('zh-u-nu-fullwide');
printNumberFormat('zh-u-nu-guru');
printNumberFormat('zh-u-nu-hanidec');
printNumberFormat('zh-Hant-u-nu-hanidec');
printNumberFormat('zh-u-nu-hmng');
printNumberFormat('zh-u-nu-hmnp');
printNumberFormat('zh-u-nu-khmr');
printNumberFormat('zh-u-nu-knda');
printNumberFormat('zh-u-nu-laoo');
printNumberFormat('zh-u-nu-latn');
printNumberFormat('zh-u-nu-limb');
printNumberFormat('zh-u-nu-mlym');
printNumberFormat('zh-u-nu-orya');
printNumberFormat('zh-u-nu-thai');
printNumberFormat('zh-u-nu-tibt');

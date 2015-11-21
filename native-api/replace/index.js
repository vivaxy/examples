/**
 * @since 2015-11-21 16:05
 * @author vivaxy
 */
'use strict';
let string = '123abc456abc789';

let result;

// Inserts the matched substring.
result = string.replace('abc', "$&");

// 123abc456abc789
// 123abc456abc789
console.log(result);

// Inserts the portion of the string that precedes the matched substring.
result = string.replace('abc', "$`");

// 123abc456abc789
// 123123456abc789
console.log(result);

// Inserts the portion of the string that follows the matched substring.
result = string.replace('abc', "$'");

// 123abc456abc789
// 123456abc789456abc789
console.log(result);

// Where n or nn are decimal digits, inserts the nth parenthesized submatch string, provided the first argument was a RegExp object.
result = string.replace('abc', "$1");

// 123abc456abc789
// 123$1456abc789
console.log(result);

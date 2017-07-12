var context = require.context('.', true, /^\.\/dir\/.*\.js$/);
const keys = context.keys();
const filename = './dir/first-level.js';
const func = context(filename);
func();

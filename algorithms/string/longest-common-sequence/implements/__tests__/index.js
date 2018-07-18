/**
 * @since 20180712 19:49
 * @author vivaxy
 */

const test = require('ava');
const longestCommonSubstring = require('../index.js');

test('longest common sequence', (t) => {

  t.is(longestCommonSubstring('CATCGA', 'GTACCGTCA'), 'CTCA');

});

/**
 * @since 20180419 18:08
 * @author vivaxy
 */

const fs = require('fs');
const path = require('path');

module.exports = (filename) => {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', filename));
};

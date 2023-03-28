/**
 * @since 2023-03-28
 * @author vivaxy
 */
const { Transform } = require('stream');

module.exports = class SSE extends Transform {
  _transform(data, enc, cb) {
    this.push('data: ' + data.toString() + '\n\n');
    cb();
  }
};

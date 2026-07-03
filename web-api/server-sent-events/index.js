const { Transform } = require('stream');

module.exports = class SSE extends Transform {
  _transform(data, enc, cb) {
    this.push('data: ' + data.toString() + '\n\n');
    cb();
  }
};

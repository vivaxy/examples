/**
 * @since 2015-11-21 13:57
 * @author vivaxy
 */
'use strict';
module.exports = [
  function* (next) {
    if (this.request.path === '/event-source') {
      this.type = 'text/event-stream';
      this.body = '{"code": 200}';
    }
    yield next;
  },
];

/**
 * @since 15-09-03 09:37
 * @author vivaxy
 */
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var BrowserTracker = (function () {
  function BrowserTracker() {
    _classCallCheck(this, BrowserTracker);

    this.remote = '/browser-tracker-server';
  }

  _createClass(BrowserTracker, [
    {
      key: 'push',
      value: function push(o) {
        navigator.sendBeacon(this.remote, JSON.stringify(o));
        return this;
      },
    },
  ]);

  return BrowserTracker;
})();

window._browserTracker = window._browserTracker || [];
if (!(window._browserTracker instanceof BrowserTracker)) {
  var browserTrackerRecord = window._browserTracker;
  window._browserTracker = new BrowserTracker();
  browserTrackerRecord.forEach(function (data) {
    window._browserTracker.push(data);
  });
}

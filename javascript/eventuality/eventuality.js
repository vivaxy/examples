/**
 * @since 150208 15:22
 * @author vivaxy
 */

/**
 * use `object = eventuality(object);` to initialize
 * use `object.on(type, callback);` to bind callbacks on event
 * use `object.fire(type, data);` to emit event with data
 *
 * object can be HTMLElement, data fired is a HTMLEvents
 * data is stored in HTMLEvents.data
 *
 * object can be a Constructor, use `eventuality(this);` or `this = eventuality(this);`
 * object can be a Constructor.prototype, use `eventuality(Constructor.prototype);`
 * object can be an instance of Constructor, use `eventuality(instance);`
 *
 * support ie9+, webkit
 *
 * @param {(Object|HTMLElement)} that
 * @returns {*}
 */
var eventuality = function (that) {

    if (that instanceof HTMLElement) {

        var createEvent = function (type, data) {
            var event = window.document.createEvent('HTMLEvents');
            event.initEvent(type, true, true);
            // data stored in data
            event.data = data;
            return event;
        };

        that.fire = function (type, data) {
            that.dispatchEvent(createEvent(type, data));
        };

        that.on = function (type, callback) {
            that.addEventListener(type, callback, false);
        };

        return that;

    } else {

        var events = {};

        that.fire = function (type, data) {
            var callbacks, i;

            callbacks = events[type];
            if (callbacks) {
                for (i = 0; i < callbacks.length; i++) {
                    callbacks[i].apply(that, [data]);
                }
            }

            return that;
        };

        that.on = function (type, callback) {
            if (events.hasOwnProperty(type)) {
                events[type].push(callback);
            } else {
                events[type] = [callback];
            }
            return that;
        };

        return that;
    }
};
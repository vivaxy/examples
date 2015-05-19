/**
 * @since 150208 15:22
 * @author vivaxy
 */
var eventuality = function (that) {

    var events = {};

    that.fire = function (event) {

        var array, callback, handler, i, type = typeof event === 'string' ? event : event.type;

        if (events.hasOwnProperty(type)) {

            array = events[type];

            for (i = 0; i < array.length; i++) {

                handler = array[i];
                callback = handler.method;
                if (typeof callback === 'string') {
                    callback = this[callback];
                }
                // find where data comes from
                // on(event, function, data);
                // fire(event, data);
                var data = Array.prototype.slice.call(arguments, 1).length > 0 ? Array.prototype.slice.call(arguments, 1) :
                    handler.parameters.length > 0 ? handler.parameters : [event];

                callback.apply(this, data);
            }
        }

        return this;
    };

    that.on = function (type, method) {

        var handler = {
            method: method,
            parameters: Array.prototype.slice.call(arguments, 2)
        };

        if (events.hasOwnProperty(type)) {
            events[type].push(handler);
        } else {
            events[type] = [handler];
        }
        return this;

    };

    return that;
};

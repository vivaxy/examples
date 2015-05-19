// https://github.com/pukhalski/tap
/**
 * @since 150213 13:09
 * @author vivaxy
 */
/**
 * usage
 *
 * ```js
 * element.addEventListener('tap', function(e){
 *     var target = e.target;
 *     var x = e.x;
 *     var y = e.y;
 * }, false);
 * ```
 *
 * support ie9+, webkit
 */
(function (window) {
    var Tap = {};

    var utils = {};

    utils.attachEvent = function (element, eventName, callback) {
        return element.addEventListener(eventName, callback, false);
    };

    utils.fireFakeEvent = function (e, eventName, coords) {
        return e.target.dispatchEvent(utils.createEvent(eventName, coords));
    };

    utils.createEvent = function (name, coords) {
        var event = window.document.createEvent('HTMLEvents');
        event.initEvent(name, true, true);

        var coordinate = coords.move || coords.start;

        event.x = coordinate[0];
        event.y = coordinate[1];

        return event;
    };

    utils.getRealEvent = function (e) {
        return e && e.touches && e.touches.length ? e.touches[0] : e;
    };

    utils.getCoordinate = function (e) {
        var x = e.offsetX || e.pageX - e.target.offsetLeft;
        var y = e.offsetY || e.pageY - e.target.offsetTop;
        return [x, y];
    };

    var eventMatrix = [{
        // Touchable devices
        test: ( 'propertyIsEnumerable' in window || 'hasOwnProperty' in document ) && ( window.propertyIsEnumerable('ontouchstart') || document.hasOwnProperty('ontouchstart') ),
        events: {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend'
        }
    }, {
        // IE10
        test: window.navigator.msPointerEnabled,
        events: {
            start: 'MSPointerDown',
            move: 'MSPointerMove',
            end: 'MSPointerUp'
        }
    }, {
        // Modern device agnostic web
        test: window.navigator.pointerEnabled,
        events: {
            start: 'pointerdown',
            move: 'pointermove',
            end: 'pointerup'
        }
    }];

    Tap.options = {
        eventName: 'tap',
        fingerMaxOffset: 11
    };

    var attachDeviceEvent, init, handlers, deviceEvents, coords = {};

    attachDeviceEvent = function (eventName) {
        return utils.attachEvent(document.body, deviceEvents[eventName], handlers[eventName]);
    };

    handlers = {
        start: function (e) {
            e = utils.getRealEvent(e);

            coords.start = utils.getCoordinate(e);
            coords.offset = [0, 0];
        },

        move: function (e) {
            if (!coords['start'] && !coords['move']) return false;

            e = utils.getRealEvent(e);

            coords.move = utils.getCoordinate(e);
            coords.offset = [
                Math.abs(coords.move[0] - coords.start[0]),
                Math.abs(coords.move[1] - coords.start[1])
            ];
        },

        end: function (e) {
            e = utils.getRealEvent(e);

            if (coords.offset[0] < Tap.options.fingerMaxOffset && coords.offset[1] < Tap.options.fingerMaxOffset && !utils.fireFakeEvent(e, Tap.options.eventName, coords)) {
                if (window.navigator.msPointerEnabled || window.navigator.pointerEnabled) {
                    var preventDefault = function (clickEvent) {
                        clickEvent.preventDefault();
                        e.target.removeEventListener('click', preventDefault);
                    };

                    e.target.addEventListener('click', preventDefault, false);
                }

                e.preventDefault();
            }

            coords = {};
        },

        click: function (e) {
            if (!utils.fireFakeEvent(e, Tap.options.eventName, {start: utils.getCoordinate(e)})) {
                return e.preventDefault();
            }
        }
    };

    init = function () {
        for (var i = 0, l = eventMatrix.length; i < l; i++) {
            if (eventMatrix[i].test) {
                deviceEvents = eventMatrix[i].events;

                attachDeviceEvent('start');
                attachDeviceEvent('move');
                attachDeviceEvent('end');

                return false;
            }
        }

        return utils.attachEvent(document.body, 'click', handlers['click']);
    };

    utils.attachEvent(window, 'load', init);

})(window);

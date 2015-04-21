/**
 * @since 150119 09:43
 * @author vivaxy
 */
var demo = document.querySelector('.demo'),
    getTransitionEndEventName = function () {
        var transitions = {
                "transition": "transitionend",
                "WebkitTransition": "webkitTransitionEnd",
                "MozTransition": "transitionend"
            },
            el = document.createElement("div");
        for (var i in transitions) {
            if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                return transitions[i];
            }
        }
        return 'transitionend';
    };

demo.addEventListener(getTransitionEndEventName(), function (e) {
    console.log('transitionEnd', e);
    demo.classList.toggle('to');
}, false);

setTimeout(function () {
    demo.classList.add('to');
}, 0);

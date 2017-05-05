/**
 * @since 2017-05-05 10:09:18
 * @author vivaxy
 * passive events
 * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 * remove <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
 */

const manipulation = document.querySelector('.js-manipulation');
const defaultTouchAction = document.querySelector('.js-default');
const consoleDOM = document.querySelector('.js-console');

const getNow = () => {
    return Date.now();
};

const log = (message) => {
    consoleDOM.innerHTML += message;
    consoleDOM.innerHTML += '\n\r';
    console.log(message);
};

const diff = (element) => {
    let beginTime = 0;
    element.addEventListener('touchstart', () => {
        beginTime = getNow();
    }, {
        passive: false
    });
    element.addEventListener('click', () => {
        log(getNow() - beginTime);
    });
};

diff(manipulation);
diff(defaultTouchAction);

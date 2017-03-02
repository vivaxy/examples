/**
 * @since 2017-03-02 09:55
 * @author vivaxy
 */

const root = document.querySelector('.js-root');

const documentElement = document.documentElement;

// getBoundingClientRect
const testGetBoundingClientRect = () => {
    return documentElement.getBoundingClientRect().width;
};

// innerWidth
const testInnerWidth = () => {
    return window.innerWidth;
};

// clientWidth
const testClientWidth = () => {
    return documentElement.clientWidth;
};

const getNow = () => {
    return new Date().getTime();
};

const count = 1000000;
const run = (func) => {
    const beginTime = getNow();
    for (let i = 0; i < 1000000; i++) {
        func();
    }
    const endTime = getNow();
    return endTime - beginTime;
};

root.innerHTML = `<p>getBoundingClientRect ${run(testGetBoundingClientRect)}ms</p>
<p>innerWidth ${run(testInnerWidth)}ms</p>
<p>clientWidth ${run(testClientWidth)}ms</p>`;

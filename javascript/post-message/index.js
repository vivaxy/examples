/**
 * @since 2017-03-07 20:41
 * @author vivaxy
 */

import url from 'url';

const open = document.querySelector('.js-open');
const close = document.querySelector('.js-close');
const logContainer = document.querySelector('.js-log');

const log = (message) => {
    logContainer.innerHTML += `<p>${message}</p>`;
};

const currentURL = url.parse(location.href, true);
const currentPage = Number(currentURL.query.page || 0);
const nextPage = currentPage + 1;

const nextURL = url.format({
    protocol: location.protocol,
    host: location.host,
    pathname: location.pathname,
    query: {
        page: nextPage,
    },
});

let interval = null;
let target = null;
let source = null;

open.addEventListener('click', () => {
    target = window.open(nextURL);
    interval = setInterval(() => {
        target.postMessage({
            type: 'poll',
        }, location.origin);
    }, 100);
});

close.addEventListener('click', () => {
    source.postMessage({
        type: 'close',
    }, location.origin);
    window.close();
});

window.addEventListener('message', ({data, source: _source}) => {
    if (target === _source) {
        // from target page
        if (data.type === 'load') {
            log('target loaded');
            clearInterval(interval);
        }
        if (data.type === 'close') {
            log('target closed');
        }
    } else {
        // from source page
        if (!source) {
            source = _source;
        }
        if (data.type === 'poll') {
            source.postMessage({
                type: 'load',
            }, location.origin);
        }
    }
});

window.currentPage = currentPage;

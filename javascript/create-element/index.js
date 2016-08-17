/**
 * @since 2016-08-17 09:24
 * @author vivaxy
 */

var head = document.head;
var body = document.body;

// test script
var script = createElement('script', null, {
    src: './test-script.js',
    type: 'text/javascript'
});
body.appendChild(script);

// test div
var div = createElement('div', {
    backgroundColor: '#f63',
    width: '100px',
    height: '100px'
}, null, {
    'data-display-id': 1
});
body.appendChild(div);

// test link
var link = createElement('link', null, {
    type: 'image/png',
    rel: 'shortcut icon',
    href: '/vivaxy.icon.png'
});
head.appendChild(link);

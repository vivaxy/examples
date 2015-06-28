/**
 * @since 150628 12:57
 * @author vivaxy
 */
styleSheet.insertRule('body' +
    '{' +
    'margin: 0;' +
    'position: absolute;' +
    'width: 100%;' +
    'height: 100%;' +
    '}', 0);

setTimeout(function () {
    styleSheet.insertRule('body' +
        '{' +
        'background-color: #f00;' +
        '}', 0);
}, 3000);

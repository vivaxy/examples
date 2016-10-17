/**
 * @since 2016-10-17 15:21
 * @author vivaxy
 */

import 'es5-shim';
import 'es5-shim/es5-sham';
import 'console-polyfill';
import OnScreen from 'onscreen';

const os = new OnScreen({
    tolerance: 50
});

os.on('enter', '.js-element', function () {
    document.body.style.backgroundColor = 'yellow';
});

os.on('leave', '.js-element', function () {
    document.body.style.backgroundColor = 'white';
});

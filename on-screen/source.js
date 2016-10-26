/**
 * @since 2016-10-17 15:21
 * @author vivaxy
 */

import 'es5-shim';
import 'es5-shim/es5-sham';
import 'console-polyfill';
import OnScreen from 'onscreen';

const SELECTOR = '.js-element';
const CLICK = 'click';
const panel = document.querySelector('.js-panel');

const os = new OnScreen({
    tolerance: 50
});

os.on('enter', SELECTOR, function() {
    panel.style.backgroundColor = 'yellow';
});

os.on('leave', SELECTOR, function() {
    panel.style.backgroundColor = 'white';
});

const element = document.querySelector(SELECTOR);
const check = panel.querySelector('.js-check');
const toggleDisplay = panel.querySelector('.js-toggle-display');
const toggleElement = panel.querySelector('.js-toggle-element');
const toggleVisibility = panel.querySelector('.js-toggle-visibility');
const toggleWidth = panel.querySelector('.js-toggle-width');
const toggleTransform = panel.querySelector('.js-toggle-transform');

check.addEventListener(CLICK, () => {
    const on = OnScreen.check(SELECTOR);
    panel.style.backgroundColor = on ? 'yellow' : 'white';
});

let display = true;
toggleDisplay.addEventListener(CLICK, () => {
    element.style.display = display ? 'none' : 'block';
    display = !display;
});

let elementExist = true;
const parent = document.body;
toggleElement.addEventListener(CLICK, () => {
    if (elementExist) {
        parent.removeChild(element);
    } else {
        parent.appendChild(element);
    }
    elementExist = !elementExist;
});

let visibility = true;
toggleVisibility.addEventListener(CLICK, () => {
    element.style.visibility = visibility ? 'hidden' : 'visible';
    visibility = !visibility;
});

let width = true;
toggleWidth.addEventListener(CLICK, () => {
    element.style.width = width ? '0px' : '100px';
    width = !width;
});

let transform = true;
toggleTransform.addEventListener(CLICK, () => {
    element.style.msTransform = transform ? 'translateX(1000%)' : 'translateX(0)';
    element.style.mozTransform = transform ? 'translateX(1000%)' : 'translateX(0)';
    element.style.webkitTransform = transform ? 'translateX(1000%)' : 'translateX(0)';
    element.style.transform = transform ? 'translateX(1000%)' : 'translateX(0)';
    transform = !transform;
});

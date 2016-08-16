/**
 * @since 2016-08-16 22:25
 * @author vivaxy
 */

'use strict';

//        var IN_SCREEN_HEIGHT = 0;
var IN_SCREEN_HEIGHT = 50;
//    var IN_SCREEN_HEIGHT = Infinity;
//        var IN_SCREEN_WIDTH = 0;
var IN_SCREEN_WIDTH = 50;
//    var IN_SCREEN_WIDTH = Infinity;

var isInScreen = function (element) {

    var rect = element.getBoundingClientRect();
    var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    var elementHeight = element.offsetHeight;
    var elementWidth = element.offsetWidth;

    var inScreenHeight = IN_SCREEN_HEIGHT > elementHeight ? elementHeight : IN_SCREEN_HEIGHT;
    var inScreenWidth = IN_SCREEN_WIDTH > elementWidth ? elementWidth : IN_SCREEN_WIDTH;

    // 元素在屏幕上方
    var elementBottomToWindowTop = rect.top + elementHeight;
    var bottomBorderInScreen = elementBottomToWindowTop > inScreenHeight;

    // 元素在屏幕下方
    var elementTopToWindowBottom = windowHeight - (rect.bottom - elementHeight);
    var topBorderInScreen = elementTopToWindowBottom > inScreenHeight;

    // 元素在屏幕左侧
    var elementRightToWindowLeft = rect.left + elementWidth;
    var rightBorderInScreen = elementRightToWindowLeft > inScreenWidth;

    // 元素在屏幕右侧
    var elementLeftToWindowRight = windowWidth - (rect.right - elementWidth);
    var leftBorderInScreen = elementLeftToWindowRight > inScreenWidth;

    return bottomBorderInScreen && topBorderInScreen && rightBorderInScreen && leftBorderInScreen;
};

var element = document.querySelector('.js-element');

setInterval(function () {
    var inScreen = isInScreen(element);
    console.log(inScreen);
}, 50);

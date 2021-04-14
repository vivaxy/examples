/**
 * @since 2016-08-16 22:25
 * @author vivaxy
 */

'use strict';

// var ON_SCREEN_HEIGHT = 0;
var ON_SCREEN_HEIGHT = 50;
// var ON_SCREEN_HEIGHT = Infinity;
// var ON_SCREEN_WIDTH = 0;
var ON_SCREEN_WIDTH = 50;
// var ON_SCREEN_WIDTH = Infinity;

var isOnScreen = function (element) {
  var rect = element.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0 || element.style.opacity === '0') {
    return false;
  }

  var windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  var windowWidth = window.innerWidth || document.documentElement.clientWidth;

  var elementHeight = element.offsetHeight;
  var elementWidth = element.offsetWidth;

  var onScreenHeight =
    ON_SCREEN_HEIGHT > elementHeight ? elementHeight : ON_SCREEN_HEIGHT;
  var onScreenWidth =
    ON_SCREEN_WIDTH > elementWidth ? elementWidth : ON_SCREEN_WIDTH;

  // 元素在屏幕上方
  var elementBottomToWindowTop = rect.top + elementHeight;
  var bottomBoundingOnScreen = elementBottomToWindowTop >= onScreenHeight;

  // 元素在屏幕下方
  var elementTopToWindowBottom = windowHeight - (rect.bottom - elementHeight);
  var topBoundingOnScreen = elementTopToWindowBottom >= onScreenHeight;

  // 元素在屏幕左侧
  var elementRightToWindowLeft = rect.left + elementWidth;
  var rightBoundingOnScreen = elementRightToWindowLeft >= onScreenWidth;

  // 元素在屏幕右侧
  var elementLeftToWindowRight = windowWidth - (rect.right - elementWidth);
  var leftBoundingOnScreen = elementLeftToWindowRight >= onScreenWidth;

  return (
    bottomBoundingOnScreen &&
    topBoundingOnScreen &&
    rightBoundingOnScreen &&
    leftBoundingOnScreen
  );
};

var element = document.querySelector('.js-element');

setInterval(function () {
  var onScreen = isOnScreen(element);
  document.body.style.backgroundColor = onScreen ? 'yellow' : 'white';
}, 50);

var windowElement = document.querySelector('.window'),
  windowElementWidth = windowElement.offsetWidth;

windowElement.style.width += windowElementWidth + getScrollBarWidth() + 'px';

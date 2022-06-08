/**
 * @since 2022-06-08 08:52
 * @author vivaxy
 */
for (let i = 0; i < 100; i++) {
  const p = document.createElement('p');
  p.innerHTML = i;
  document.body.appendChild(p);
}

function logScrollTop() {
  console.log(document.documentElement.scrollTop);
}

function raf(cb, loopCount) {
  if (loopCount > 0) {
    requestAnimationFrame(function () {
      cb();
      raf(cb, loopCount - 1);
    });
  }
}

const style = document.createElement('style');
document.head.appendChild(style);

document.getElementById('toggle-style').addEventListener('click', function (e) {
  if (e.target.innerHTML.startsWith('Remove')) {
    while (style.sheet.cssRules.length) {
      style.sheet.deleteRule(0);
    }
    e.target.innerHTML = 'Add `scroll-behavior: smooth;` style';
  } else {
    style.sheet.insertRule(`
    html {
      scroll-behavior: smooth;
    }
    `);
    e.target.innerHTML = 'Remove `scroll-behavior: smooth;` style';
  }
});

document.getElementById('scroll').addEventListener('click', function () {
  let targetScrollTop = document.documentElement.scrollTop + 1000;
  if (targetScrollTop > document.documentElement.scrollHeight) {
    targetScrollTop = 0;
  }
  document.documentElement.scrollTop = targetScrollTop;
  console.log('sync log start');
  logScrollTop();
  logScrollTop();
  logScrollTop();
  console.log('sync log end');
  raf(logScrollTop, 60);
});

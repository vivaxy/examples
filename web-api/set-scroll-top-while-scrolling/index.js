/**
 * @since 2022-06-08 09:20
 * @author vivaxy
 */
for (let i = 0; i < 100; i++) {
  const p = document.createElement('p');
  p.innerHTML = i;
  document.body.appendChild(p);
}

function raf(cb, loop) {
  requestAnimationFrame(function () {
    if (loop === 0) {
      cb();
      return;
    }
    raf(cb, loop - 1);
  });
}

document.getElementById('scroll').addEventListener('click', function () {
  if (
    document.documentElement.scrollTop >
    document.documentElement.scrollHeight / 2
  ) {
    document.documentElement.scrollTop = 0;
  } else {
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
  }

  raf(function () {
    document.documentElement.scrollTop = document.documentElement.scrollTop;
  }, 5);
});

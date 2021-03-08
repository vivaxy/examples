/**
 * @since 2021-03-07 09:34
 * @author vivaxy
 * @see https://mp.weixin.qq.com/s/gxe5QOVt9kRFWvXx-gugbg
 */
let container = null;

function create({ text = '+', width = 60, height = 60 } = {}) {
  if (container) {
    throw new Error('Sticky button already exists');
  }

  container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.overflow = 'scroll';
  container.style.scrollSnapType = 'both mandatory';
  container.style.pointerEvents = 'none';

  const draggable = document.createElement('div');
  draggable.style.width = `calc(200% - ${width}px)`;
  draggable.style.height = `calc(200% - ${height}px)`;
  draggable.style.scrollSnapAlign = 'start';

  const button = document.createElement('div');
  button.style.width = `${width}px`;
  button.style.height = `${height}px`;
  button.textContent = text;
  button.style.fontSize = `${height / 2}px`;
  button.style.lineHeight = `${height}px`;
  button.style.textAlign = 'center';
  button.style.borderRadius = '50%';
  button.style.background = '#f63';
  button.style.color = '#fff';
  button.style.scrollSnapAlign = 'start';
  button.style.position = 'absolute';
  button.style.right = '0';
  button.style.bottom = '0';
  button.style.pointerEvents = 'all';
  button.addEventListener('touchstart', function () {
    container.style.pointerEvents = 'all';
  });
  document.addEventListener('touchend', function () {
    setTimeout(function () {
      container.style.pointerEvents = 'none';
    }, 1000);
  });

  container.appendChild(draggable);
  container.appendChild(button);
  document.body.appendChild(container);
}

function destory() {
  if (!container) {
    throw new Error('Stick button not created');
  }
  document.body.remove(container);
  container = null;
}

export default {
  create,
  destory,
};

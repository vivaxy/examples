/**
 * @since 2018-05-01 16:46:16
 * @author vivaxy
 */

const input = document.querySelector('input');
const button = document.querySelector('button');
const meta = document.createElement('meta');

const setMeta = () => {
  let width = input.value || '750';
  if (width === 'device-width') {
    width = window.screen.width;
  } else {
    width = Number(width);
  }
  const scale = window.screen.width / width;
  meta.setAttribute(
    'content',
    `width=${width}, initial-scale=${scale}, user-scalable=0`,
  );
  meta.setAttribute('name', 'viewport');
};

setMeta();
document.head.appendChild(meta);
button.addEventListener('click', setMeta);

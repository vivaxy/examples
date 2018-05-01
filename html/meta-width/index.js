/**
 * @since 2018-05-01 16:46:16
 * @author vivaxy
 */

const input = document.querySelector('input');
const button = document.querySelector('button');

button.addEventListener('click', () => {
  url.searchParams.set('width', input.value);
  location.href = url.href;
});

input.value = width;

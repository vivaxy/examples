/**
 * @since 2015-09-17 15:14
 * @author vivaxy
 */
const input = document.querySelector('input');

input.addEventListener('change', () => {
  document.designMode = input.checked ? 'on' : 'off';
});

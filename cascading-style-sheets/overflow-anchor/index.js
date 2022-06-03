/**
 * @since 2022-06-03 23:07
 * @author vivaxy
 */
const $container = document.querySelector('#container');
const $anchor = document.querySelector('#anchor');

$anchor.scrollIntoView();

setTimeout(() => {
  $container.classList.add('padding');
}, 3000);

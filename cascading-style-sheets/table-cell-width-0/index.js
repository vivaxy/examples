/**
 * @since 2021-09-10
 * @author vivaxy
 */
const $0_width = document.querySelector(
  'table tr:nth-child(2) td:nth-child(2)',
);
console.log(
  'window.getComputedStyle($0_width).width:',
  window.getComputedStyle($0_width).width,
);

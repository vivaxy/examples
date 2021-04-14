/**
 * @since 2015-09-17 15:14
 * @author vivaxy
 */
var input = document.querySelector('input');

input.addEventListener(
  'change',
  function () {
    console.log('date picked:', input.value);
  },
  false,
);

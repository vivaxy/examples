/**
 * @since 2016-08-05 13:11
 * @author vivaxy
 */

var checkbox = document.querySelector('.js-checkbox');
var show = document.querySelector('.js-show');
show.addEventListener('click', function () {
  if (checkbox.checked) {
    window.scrollTo(window.scrollX, window.scrollY);
  }
  var modal = document.createElement('div');
  modal.classList.add('modal');
  document.body.appendChild(modal);
  modal.addEventListener('click', function () {
    document.body.removeChild(modal);
  });
});

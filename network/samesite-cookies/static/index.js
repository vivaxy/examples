/**
 * @since 2021-03-01 20:39
 * @author vivaxy
 */
document.querySelector('#login').addEventListener('click', function () {
  fetch('/api/login');
});

document.querySelector('#logout').addEventListener('click', function () {
  fetch('/api/logout');
});

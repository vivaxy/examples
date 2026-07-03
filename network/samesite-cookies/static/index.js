document.querySelector('#login').addEventListener('click', function () {
  fetch('/api/login');
});

document.querySelector('#logout').addEventListener('click', function () {
  fetch('/api/logout');
});

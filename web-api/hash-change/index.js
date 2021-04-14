/**
 * @since 150324 18:20
 * @author vivaxy
 */

var consoleDiv = document.querySelector('.console'),
  log = function (text) {
    consoleDiv.innerHTML += text + '<hr>';
    console.log(text);
  };

window.addEventListener(
  'hashchange',
  function (e) {
    var hash = new Url(e.newURL).get('hash');
    log(hash);
  },
  false,
);

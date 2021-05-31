/**
 * @since 2021-05-31
 * @author vivaxy
 */
const $bar = document.querySelector('#bar');
const $buttonContainer = document.querySelector('#button-container');

const handlers = ['static', 'sticky', 'fixed', 'inner-scroll'];

handlers.forEach(function (key) {
  const $button = document.createElement('button');
  $button.addEventListener('click', function () {
    document.body.setAttribute('class', key);
  });
  $button.innerHTML = key;
  $buttonContainer.appendChild($button);
});

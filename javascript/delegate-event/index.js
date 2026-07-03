var containerElement = document.querySelector('.container');

delegateEvent('click', containerElement, '.box', function (e) {
  console.log(e);
});

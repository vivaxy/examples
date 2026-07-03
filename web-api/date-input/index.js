var input = document.querySelector('input');

input.addEventListener(
  'change',
  function () {
    console.log('date picked:', input.value);
  },
  false,
);

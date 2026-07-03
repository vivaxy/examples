const input = document.querySelector('input');

input.addEventListener('change', () => {
  document.designMode = input.checked ? 'on' : 'off';
});

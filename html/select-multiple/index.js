const select = document.querySelector('.js-select');
select.addEventListener('change', (e) => {
    console.log('e.target.selectedOptions', e.target.selectedOptions);
    console.log('e.target.value', e.target.value);
});

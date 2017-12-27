/**
 * @since 20171227 14:46
 * @author vivaxy
 */

const select = document.querySelector('#background-attachment');
const content = document.querySelector('#content');

function updateBackgroundAttachment(e) {
    content.style.backgroundAttachment = e.target.value;
}

select.addEventListener('change', updateBackgroundAttachment);

updateBackgroundAttachment({ target: { value: select.value } });

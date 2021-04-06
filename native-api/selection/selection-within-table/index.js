/**
 * @since 2021-04-06 11:22
 * @author vivaxy
 */
function getDetailedParagraphNode() {
  const el = document.querySelector('#table-wrapper');
  return el.querySelector('p');
}

function updateDetailedParagraph() {
  const el = getDetailedParagraphNode();
  el.textContent = `contenteditable="${el.isContentEditable}"; user-select: ${
    el.style.userSelect || 'auto'
  }`;
}

document.addEventListener('selectionchange', function () {
  const sel = window.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
});

document
  .querySelector('#toggle-contenteditable-on-table-wrapper')
  .addEventListener('click', function () {
    const el = document.querySelector('#table-wrapper');
    const contentediable = String(!el.isContentEditable);
    el.setAttribute('contenteditable', contentediable);

    updateDetailedParagraph();
  });

document
  .querySelector('#toggle-user-select-on-table-wrapper')
  .addEventListener('click', function () {
    const el = document.querySelector('#table-wrapper');
    const userSelect = el.style.userSelect === 'none' ? 'auto' : 'none';
    el.style.userSelect = userSelect;
    updateDetailedParagraph();
  });

document
  .querySelector('#select-into-not-contentediable-nodes')
  .addEventListener('click', function () {
    window
      .getSelection()
      .setBaseAndExtent(
        document.querySelector('#content-editable').childNodes[0],
        1,
        getDetailedParagraphNode().childNodes[0],
        2,
      );
  });

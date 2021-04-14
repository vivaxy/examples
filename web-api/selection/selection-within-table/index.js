/**
 * @since 2021-04-06 11:22
 * @author vivaxy
 */
function getTableWrapperNode() {
  return document.querySelector('#table-wrapper');
}

function getExplanationParagraphNode() {
  const tableWarpper = getTableWrapperNode();
  return tableWarpper.querySelector('p');
}

function updateDetailedParagraph() {
  const tableWrapper = getTableWrapperNode();
  const explanation = getExplanationParagraphNode();
  explanation.innerHTML = `tableWrapper.isContentEditable: ${
    tableWrapper.isContentEditable
  }<br>user-select: ${
    tableWrapper.style.userSelect || 'auto'
  }<br>tableCellPNode.isContentEditable: ${
    tableWrapper.querySelector('table').querySelector('p').isContentEditable
  }`;
}

document.addEventListener('selectionchange', function () {
  const sel = window.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
});

document
  .querySelector('#toggle-contenteditable-on-table-wrapper')
  .addEventListener('click', function () {
    const tableWrapper = getTableWrapperNode();
    const contentediable = String(!tableWrapper.isContentEditable);
    tableWrapper.setAttribute('contenteditable', contentediable);
    updateDetailedParagraph();
  });

document
  .querySelector('#toggle-user-select-on-table-wrapper')
  .addEventListener('click', function () {
    const tableWrapper = getTableWrapperNode();
    const userSelect =
      tableWrapper.style.userSelect === 'none' ? 'auto' : 'none';
    tableWrapper.style.userSelect = userSelect;
    updateDetailedParagraph();
  });

document
  .querySelector('#toggle-table-cell-editable')
  .addEventListener('click', function () {
    const tableWrapper = getTableWrapperNode();
    Array.from(
      tableWrapper.querySelector('table').querySelectorAll('p'),
    ).forEach(function (pNode) {
      const contentediable = !pNode.isContentEditable;
      pNode.setAttribute('contenteditable', contentediable);
    });
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
        getExplanationParagraphNode().childNodes[0],
        2,
      );
  });

document
  .querySelector('#toggle-table-height')
  .addEventListener('click', function () {
    const tdList = Array.from(getTableWrapperNode().querySelectorAll('td'));
    tdList.forEach(function (td) {
      const height = td.height === '1000' ? '30' : '1000';
      td.height = height;
    });
  });

updateDetailedParagraph();

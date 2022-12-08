/**
 * @since 2022-12-08 15:49
 * @author vivaxy
 */
const source = document.getElementById('source');
const target = document.getElementById('target');

source.addEventListener('scroll', function () {
  target.scrollLeft = source.scrollLeft;
  target.scrollTop = source.scrollTop;
});

target.addEventListener('scroll', function () {
  source.scrollLeft = target.scrollLeft;
  source.scrollTop = target.scrollTop;
});

function createElement(tagName) {
  return document.createElement(tagName);
}

function addTable(container, rowCount = 100, colCount = 100) {
  const table = createElement('table');
  const tbody = createElement('tbody');
  for (let i = 0; i < rowCount; i++) {
    const tr = createElement('tr');
    for (let j = 0; j < colCount; j++) {
      const td = createElement('td');
      const p = createElement('p');
      p.innerHTML = '1234567890';
      td.appendChild(p);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

addTable(source);
addTable(target);

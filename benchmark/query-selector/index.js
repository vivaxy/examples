/**
 * @since 2021-06-09
 * @author vivaxy
 */
function createId(index) {
  return `id-${index}`;
}

const DIV_COUNT = 1e5;
for (let i = 0; i < DIV_COUNT; i++) {
  const div = document.createElement('div');
  const id = createId(i);
  div.setAttribute('data-id', id);
  div.id = id;
  div.innerHTML = id;
  document.body.appendChild(div);
}

const firstId = createId(0);
const lastId = createId(DIV_COUNT - 1);

function benchmark(fn) {
  const COUNT = 1;
  const startTime = Date.now();
  for (let i = 0; i < COUNT; i++) {
    fn();
  }
  const endTime = Date.now();
  console.log(`${fn.name} executed for ${(endTime - startTime) / COUNT}ms`);
}

setTimeout(function () {
  [
    function getElementByIdForFirstNode() {
      document.getElementById(String(firstId));
    },

    function getElementByIdForLastNode() {
      document.getElementById(String(lastId));
    },

    function querySelectByIdForFirstNode() {
      document.querySelector(`#${firstId}`);
    },

    function querySelectByIdForLastNode() {
      document.querySelector(`#${lastId}`);
    },

    function querySelectByAttributeForFirstNode() {
      document.querySelector(`[data-id="${firstId}"]`);
    },

    function querySelectByAttributeForLastNode() {
      document.querySelector(`[data-id="${lastId}"]`);
    },
  ].forEach(benchmark);
}, 0);

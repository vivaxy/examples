const node = document.getElementById('node');

const clientRects = node.getClientRects();
const boundingClientRects = node.getBoundingClientRect();

console.log('clientRects', clientRects);

console.log('boundingClientRects', boundingClientRects);

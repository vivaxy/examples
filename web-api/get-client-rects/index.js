/**
 * @since 2023-06-21
 * @author vivaxy
 */
const node = document.getElementById('node');

const clientRects = node.getClientRects();
const boundingClientRects = node.getBoundingClientRect();

console.log('clientRects', clientRects);

console.log('boundingClientRects', boundingClientRects);

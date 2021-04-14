/**
 * @since 2021-04-14 15:01
 * @author vivaxy
 */
const contentNode = document.querySelector('#content');
const before = contentNode.childNodes[0];
console.log('before', before);
const after = before.splitText(5);
console.log('before', before, 'after', after);
contentNode.normalize();
console.log('merged', contentNode.childNodes[0]);

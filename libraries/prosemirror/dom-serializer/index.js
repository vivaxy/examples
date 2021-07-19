/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: function toDOM() {
        return ['p', 0];
      },
    },
    text: {
      group: 'inline',
    },
  },
});

const input = '<p>ABC</p>';
const $input = document.createElement('div');
$input.innerHTML = input;
const doc = DOMParser.fromSchema(schema).parse($input);
const domSerializer = new DOMSerializer({
  doc() {
    return ['div', 0];
  },
  paragraph() {
    return ['p', 0];
  },
  text(node) {
    return node.text;
  },
});

const serialized = domSerializer.serializeNode(doc);
console.log('serialized', serialized.outerHTML);

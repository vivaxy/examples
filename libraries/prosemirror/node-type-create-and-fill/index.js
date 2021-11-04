/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { DOMSerializer, Schema } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: {
      content: 'title block+',
    },

    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },

    text: {
      group: 'inline',
    },

    title: {
      content: 'inline*',
      parseDOM: [{ tag: 'title' }],
      toDOM() {
        return ['title', 0];
      },
    },
  },
});

function logDoc(doc) {
  const $fragment = DOMSerializer.fromSchema(schema).serializeFragment(
    doc.content,
  );
  const $parent = document.createElement('div');
  $parent.appendChild($fragment);
  console.log(`<doc>${$parent.innerHTML}</doc>`);
}

const doc1 = schema.nodes.doc.createAndFill(
  {},
  schema.nodes.paragraph.create({}, schema.text('123')),
);

logDoc(doc1);

const doc2 = schema.nodes.doc.createAndFill(
  {},
  schema.nodes.title.create({}, schema.text('123')),
);
logDoc(doc2);

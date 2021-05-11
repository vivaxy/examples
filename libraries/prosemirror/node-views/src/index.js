/**
 * @since 2021-05-11
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});

class ImageView {
  constructor(node) {
    this.dom = document.createElement('div');
    const p = document.createElement('p');
    p.innerHTML = 'This is a custom node view';
    const image = document.createElement('img');
    image.src = node.attrs.src;

    this.dom.appendChild(p);
    this.dom.appendChild(image);

    this.dom.addEventListener('click', (e) => {
      console.log('You clicked me!');
      e.preventDefault();
    });
  }

  stopEvent() {
    return true;
  }
}

const view = new EditorView(document.querySelector('#editor'), {
  state,
  nodeViews: {
    image(node) {
      return new ImageView(node);
    },
  },
});

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

class ParagraphViewWithoutContentDOM {
  constructor(node) {
    this.dom = document.createElement('h1');
    this.renderContent(node);
  }

  update(node) {
    if (node.type.name !== 'paragraph') {
      return false;
    }
    this.renderContent(node);
    return true;
  }

  renderContent(node) {
    this.dom.innerHTML = `<p>${node.textContent}</p>`;
  }
}

class ParagraphViewWithContentDOM {
  constructor(node) {
    this.dom = document.createElement('h1');
    this.contentDOM = document.createElement('span');
    this.fakeContentDOM = document.createElement('span');
    this.fakeContentDOM.innerHTML = node.textContent;
    this.dom.appendChild(this.contentDOM);
    this.dom.appendChild(this.fakeContentDOM);
  }

  update(node) {
    if (node.type.name !== 'paragraph') {
      return false;
    }
    this.fakeContentDOM.innerHTML = node.textContent;
    return true;
  }
}

class ImageView {
  constructor(node, view, getPos) {
    this.dom = document.createElement('div');
    this.p = document.createElement('p');
    this.p.style.fontSize = '14px';
    this.updateParagraph(getPos);
    const image = document.createElement('img');
    image.src = node.attrs.src;

    this.dom.appendChild(this.p);
    this.dom.appendChild(image);

    this.dom.addEventListener('click', (e) => {
      console.log('click with pos ' + getPos());
      e.preventDefault();
    });
  }

  stopEvent() {
    return true;
  }

  updateParagraph(getPos) {
    this.p.innerHTML = 'This is a custom node view at ' + getPos();
  }

  update(node, view, getPos) {
    console.log('update');
    if (node.type.name !== 'image') {
      return false;
    }
    this.updateParagraph(getPos);
    return true;
  }
}

const view = new EditorView(document.querySelector('#editor'), {
  state,
  nodeViews: {
    paragraph(node) {
      return new ParagraphViewWithContentDOM(node);
    },
    image(node, view, getPos) {
      return new ImageView(node, view, getPos);
    },
  },
});

window.view = view;

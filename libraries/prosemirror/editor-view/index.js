/**
 * @since 2021-06-01
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

function querySelector(query) {
  return document.querySelector(query);
}

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});

let lastDragging = null;

function handleDrag(editorView, e) {
  if (editorView.dragging !== lastDragging) {
    const {
      slice: { openEnd, openStart },
      move,
    } = editorView.dragging;
    console.log(e.type, {
      slice: {
        openEnd,
        openStart,
      },
      move,
    });
    lastDragging = editorView.dragging;
  }
}

function handleKeyDown(editorView) {
  console.log(editorView.composing);
}

const editorView = new EditorView(querySelector('#editor'), {
  state,
  handleDOMEvents: {
    dragstart: handleDrag,
    drag: handleDrag,
    dragover: handleDrag,
    dragenter: handleDrag,
    dragleave: handleDrag,
    dragexit: handleDrag,
    drop: handleDrag,
    dragend: handleDrag,
    keydown: handleKeyDown,
  },
});

window.editorView = editorView;

querySelector('#posAtCoords').addEventListener('click', function () {
  const left = Number(querySelector('#left').value);
  const top = Number(querySelector('#top').value);
  console.log('posAtCoords', editorView.posAtCoords({ left, top }));
});

querySelector('#coordsAtPos').addEventListener('click', function () {
  const pos = Number(querySelector('#pos').value);
  const side = Number(querySelector('#side').value);
  console.log('coordsAtPos', editorView.coordsAtPos(pos, side));
});

querySelector('#domAtPos').addEventListener('click', function () {
  const pos = Number(querySelector('#pos1').value);
  const side = Number(querySelector('#side1').value);
  console.log('domAtPos', editorView.domAtPos(pos, side));
});

querySelector('#nodeDOM').addEventListener('click', function () {
  const pos = Number(querySelector('#pos2').value);
  console.log('nodeDOM', editorView.nodeDOM(pos));
});

querySelector('#posAtDOM').addEventListener('click', function () {
  const node = editorView.dom.querySelector('p').childNodes[0];
  const offset = Number(querySelector('#offset').value);
  const bias = Number(querySelector('#bias').value);
  console.log('posAtDOM', editorView.posAtDOM(node, offset, bias));
});

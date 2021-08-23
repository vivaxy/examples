/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { ySyncPlugin } from 'y-prosemirror';
import { toJSON, DATA_TYPES } from '../data-visualization/src/data-viewer';

const XML_FRAGMENT_KEY = 'prosemirror';
const schema = new Schema({
  nodes: {
    doc: {
      content: 'paragraph+',
    },
    text: {
      group: 'inline',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM(node) {
        return ['p', node.attrs, 0];
      },
    },
  },
  marks: {
    color: {
      attrs: {
        color: { default: 'black' },
      },
      parseDOM: [
        {
          tag: 'span[style*=color]',
          getAttrs: (dom) => ({ color: dom.style.color }),
        },
      ],
      toDOM(node) {
        return ['span', { style: `color: ${node.attrs.color}` }];
      },
    },
  },
});

function createEditor(yDoc) {
  return new EditorView(null, {
    state: EditorState.create({
      schema,
      plugins: [ySyncPlugin(yDoc.get(XML_FRAGMENT_KEY, Y.XmlFragment))],
    }),
  });
}

const errors = {
  unexpectedType(type) {
    return new Error('Unexpected type: ' + type);
  },
};

function printYText(yDoc, message = '') {
  const xmlText = getXmlTextFromYDoc(yDoc);
  const json = toJSON(xmlText, Y);
  console.log(
    message,
    json.xmlText
      .map(function (item) {
        if (item.content.type === DATA_TYPES.CONTENT_FORMAT) {
          if (item.content.value === null) {
            return `</${item.content.key}>`;
          }
          const attrs = Object.keys(item.content.value)
            .map(function (key) {
              return `${key}="${item.content.value[key]}"`;
            })
            .join(' ');
          return `<${item.content.key} ${attrs}>`;
        }
        if (item.content.type === DATA_TYPES.CONTENT_STRING) {
          return `${item.content.string}`;
        }
        if (item.content.type === DATA_TYPES.CONTENT_DELETED) {
          return `<ContentDeleted />`;
        }
        throw errors.unexpectedType(item.content.type);
      })
      .join(' ➜ '),
  );
}

function printPText(pDoc, message = '') {
  const paragraph = pDoc.content.content.find(function (content) {
    return content.content.content.length !== 0;
  });
  const textNodes = paragraph.content.content;
  console.log(
    message,
    textNodes
      .map(function (node) {
        if (node.marks) {
          return node.marks.reduce(function (res, mark) {
            const attrs = Object.keys(mark.attrs)
              .map(function (attrKey) {
                return `${attrKey}="${mark.attrs[attrKey]}"`;
              })
              .join(' ');
            return `<${mark.type.name} ${attrs}>${res}</${mark.type.name}>`;
          }, node.text);
        }
        return node.text;
      })
      .join(''),
  );
}

function createYDoc() {
  const yDoc = new Y.Doc();
  const fragment = yDoc.getXmlFragment(XML_FRAGMENT_KEY);
  const paragraph = new Y.XmlElement('paragraph');
  fragment.insert(0, [paragraph]);
  const text = new Y.XmlText();
  paragraph.insert(0, [text]);
  return yDoc;
}

function getXmlTextFromYDoc(yDoc) {
  const paragraph = yDoc
    .get(XML_FRAGMENT_KEY)
    .toArray()
    .find(function (paragraph) {
      return !!paragraph.get(0).length;
    });
  return paragraph.get(0);
}

function createColorMark(color) {
  return schema.marks.color.create({ color });
}

function localConflict() {
  console.log('localConflict');
  const yDoc = createYDoc();
  const editor = createEditor(yDoc);
  editor.dispatch(editor.state.tr.insertText('ABC'));

  editor.dispatch(editor.state.tr.addMark(1, 3, createColorMark('red')));
  editor.dispatch(editor.state.tr.addMark(2, 4, createColorMark('blue')));
  printYText(yDoc);
  // actual is <color color="red"> ➜ A ➜ <color color="blue"> ➜ B ➜ <ContentDeleted /> ➜ C ➜ </color>
  // should be <color color="red"> ➜ A ➜ </color> ➜ <color color="blue"> ➜ B ➜ C ➜ </color>
  printPText(editor.state.doc); // <color color="red">A</color><color color="blue">BC</color>

  // remove blue on "B"
  editor.dispatch(editor.state.tr.removeMark(2, 3, createColorMark('blue')));
  printYText(yDoc);
  // actual is <color color="red"> ➜ A ➜ </color> ➜ <ContentDeleted /> ➜ B ➜ <ContentDeleted /> ➜ <color color="blue"> ➜ C ➜ </color>
  // should be <color color="red"> ➜ A ➜ </color> ➜ <ContentDeleted /> ➜ B ➜ <color color="blue"> ➜ C ➜ </color>
  printPText(editor.state.doc); // <color color="red">A</color>B<color color="blue">C</color>
}

function remoteConflict() {
  console.log('remoteConflict');
  const yDoc1 = createYDoc();
  const editor1 = createEditor(yDoc1);
  editor1.dispatch(editor1.state.tr.insertText('ABC'));
  const sv1_1 = Y.encodeStateVector(yDoc1);

  const yDoc2 = createYDoc();
  const editor2 = createEditor(yDoc2);
  Y.applyUpdate(yDoc2, Y.encodeStateAsUpdate(yDoc1));
  printPText(editor2.state.doc, 'pDoc2');

  editor1.dispatch(editor1.state.tr.addMark(1, 3, createColorMark('red')));
  editor2.dispatch(editor2.state.tr.addMark(2, 4, createColorMark('blue')));
  Y.applyUpdate(yDoc2, Y.encodeStateAsUpdate(yDoc1, sv1_1));
  printYText(yDoc2, 'yDoc2');
  // actual is <color color="red"> ➜ A ➜ <color color="blue"> ➜ B ➜ </color> ➜ C ➜ </color>
  // should be <color color="red" id="1_3"> ➜ A ➜ <color color="blue" id="2_0"> ➜ B ➜ </color id="1_3"> ➜ C ➜ </color id="2_0">
  printPText(editor2.state.doc, 'pDoc2');
  // actual is <color color="red">A</color><color color="blue">B</color>C
  // should be <color color="red">AB</color><color color="blue">C</color>
  //        or <color color="red">A</color><color color="blue">BC</color>

  // remove blue on "B"
  editor2.dispatch(editor2.state.tr.removeMark(2, 3, createColorMark('blue')));
  printYText(yDoc2, 'yDoc2 2');
  // actual is <ContentDeleted /> ➜ <color color="red"> ➜ A ➜ </color> ➜ B ➜ <ContentDeleted /> ➜ C
  // should be <color color="red" id="1_3"> ➜ A ➜ </color id="1_3"> ➜ <ContentDeleted /> ➜ B ➜ <ContentDeleted /> ➜ <color color="blue" id="2_1"> ➜ C ➜ <ContentDeleted /> ➜ </color id="2_1">
  printPText(editor2.state.doc, 'pDoc2 2');
  // actual is <color color="red">A</color>BC
  // should be <color color="red">A</color>B<color color="blue">C</color>
}

localConflict();
remoteConflict();

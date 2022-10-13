/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

function handleCopyOrPaste(view, event) {
  const oSetData = event.clipboardData.setData.bind(event.clipboardData);
  event.clipboardData.setData = function (mime, value) {
    if (mime === 'text/html') {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'uiEvent');
      meta.setAttribute('content', event.type);
      value += meta.outerHTML;
    }
    oSetData(mime, value);
    event.clipboardData.setData = oSetData;
  };
  return false;
}

const copyOrCutPluginKey = new PluginKey('copy-or-cut');
const copyOrCutPlugin = new Plugin({
  key: copyOrCutPluginKey,
  props: {
    handleDOMEvents: {
      copy: handleCopyOrPaste,
      cut: handleCopyOrPaste,
    },
    transformPastedHTML(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      const uiEventMeta = div.querySelector('meta[name="uiEvent"]');
      const eventType = uiEventMeta.getAttribute('content');
      console.log(`paste with ${eventType}`);
      div.removeChild(uiEventMeta);
      return div.innerHTML;
    },
  },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
    plugins: [...exampleSetup({ schema }), copyOrCutPlugin],
  }),
});

window.view = view;

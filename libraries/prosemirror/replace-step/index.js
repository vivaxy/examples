/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Slice } from 'prosemirror-model';
import { ReplaceStep } from 'prosemirror-transform';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
});

const step1 = new ReplaceStep(2, 3, Slice.empty, true);
const stepResult1 = step1.apply(state.doc);
console.log(
  'stepResult1.failed',
  stepResult1.failed,
  stepResult1.doc.toString(),
);

const step2 = new ReplaceStep(1, 2, Slice.empty, true);
const stepResult2 = step2.apply(state.doc);
console.log('stepResult2.failed', stepResult2.failed);

const step3 = new ReplaceStep(1, 2, Slice.empty, false);
const stepResult3 = step3.apply(state.doc);
console.log(
  'stepResult2.failed',
  stepResult3.failed,
  stepResult3.doc.toString(),
);

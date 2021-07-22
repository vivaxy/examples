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

const step1 = new ReplaceStep(1, 2, Slice.empty);
const step2 = new ReplaceStep(1, 2, Slice.empty);
const mergedStep = step1.merge(step2);
console.log('mergedStep', mergedStep);

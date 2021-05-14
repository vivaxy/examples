/**
 * @since 2021-04-14 10:31
 * @author vivaxy
 */
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';
import { ReplaceStep } from 'https://cdn.skypack.dev/prosemirror-transform';
import { Slice, DOMParser } from 'https://cdn.skypack.dev/prosemirror-model';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

const step = new ReplaceStep(4, 6, Slice.empty); // Delete 4-5
const map = step.getMap();
console.log(map.map(8)); // → 6
console.log(map.map(2)); // → 2 (nothing changes before the change)

const tr = state.tr;
tr.split(10); // split a node, +2 tokens at 10
tr.delete(2, 5); // -3 tokens at 2
console.log(tr.mapping.map(15)); // → 14
console.log(tr.mapping.map(6)); // → 3
console.log(tr.mapping.map(10)); // → 9
view.updateState(state.apply(tr)); // apply transaction

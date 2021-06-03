/**
 * @since 2021-04-14 10:31
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Slice, DOMParser } from 'prosemirror-model';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

function applyTransaction(tr) {
  view.updateState(view.state.apply(tr)); // apply transaction
}

/**
 * pos: 0   1 2 3 4 5 6 7 8    9
 * doc:  <p> A B C D E F G </p>
 *
 * delete 2~3
 *
 * pos: 0   1 2 3 4 5 6 7    8
 * doc:  <p> A C D E F G </p>
 */
function delete_() {
  const tr = state.tr.replace(2, 3, Slice.empty);
  applyTransaction(tr);
  const mapping = tr.mapping;
  console.log(mapping.maps[0].ranges); // -> [2, 1, 0]
  console.log(mapping.map(3)); // → 2
  console.log(mapping.map(2)); // → 2 (nothing changes before the change)
}

// delete_();

/**
 * pos: 0   1 2 3 4 5 6 7 8    9
 * doc:  <p> A B C D E F G </p>
 *
 * insert 2 with 'X'
 *
 * pos: 0   1 2 3 4 5 6 7 8 9    10
 * doc:  <p> A X B C D E F G </p>
 */
function insert() {
  const tr = state.tr.replace(
    2,
    2,
    Slice.fromJSON(schema, { content: [{ type: 'text', text: 'X' }] }),
  );
  applyTransaction(tr);
  const mapping = tr.mapping;
  console.log(mapping.maps[0].ranges); // -> [2, 0, 1]
  console.log(mapping.map(2)); // → 3 (maybe 2 or 3, default to right)
  console.log(mapping.map(2, -1)); // → 2
  console.log(mapping.map(3)); // → 4
}

// insert();

/**
 * pos: 0   1 2 3 4 5 6 7 8    9
 * doc:  <p> A B C D E F G </p>
 *
 * replace 'B' with 'X'
 *
 * pos: 0   1 2 3 4 5 6 7 8    9
 * doc:  <p> A X C D E F G </p>
 */
function replace() {
  const tr = state.tr.replace(
    2,
    3,
    Slice.fromJSON(schema, { content: [{ type: 'text', text: 'X' }] }),
  );
  applyTransaction(tr);
  const mapping = tr.mapping;
  console.log(mapping.maps[0].ranges); // -> [2, 1, 1]
  console.log(mapping.map(2)); // → 2
  console.log(mapping.map(3)); // → 3
  console.log(mapping.map(3, -1)); // → 3
}

// replace();

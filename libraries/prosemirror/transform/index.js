/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';
import { liftTarget } from 'prosemirror-transform';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});

function lift() {
  console.log('lift');
  console.log(state.doc.toString());
  const nodeRange = state.doc.resolve(2).blockRange(state.doc.resolve(3));
  const target = liftTarget(
    state.doc.resolve(0).blockRange(state.doc.resolve(1)),
  );
  const tr = state.tr.lift(nodeRange, target);
  console.log(tr.doc.toString());
  // ?
}

function wrap() {
  console.log('wrap');
  console.log(state.doc.toString());
  const nodeRange = state.doc.resolve(2).blockRange(state.doc.resolve(3));
  const tr = state.tr.wrap(nodeRange, [{ type: schema.nodes.blockquote }]);
  console.log(tr.doc.toString());
}

function setBlockType() {
  console.log('setBlockType');
  console.log(state.doc.toString());
  const tr = state.tr.setBlockType(0, 12, schema.nodes.heading, { level: 2 });
  console.log(tr.doc.toString());
}

lift();
wrap();
setBlockType();

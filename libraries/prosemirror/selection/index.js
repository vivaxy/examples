/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';
import { DOMParser } from 'https://cdn.skypack.dev/prosemirror-model';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
  dispatchTransaction(transaction) {
    const { selection } = transaction;
    const { $anchor, $head, ranges, node } = selection;
    const [{ $from, $to } = {}] = ranges;
    console.log(
      '$anchor',
      $anchor.pos,
      '$head',
      $head.pos,
      '$from',
      $from.pos,
      '$to',
      $to.pos,
      'node',
      node?.type.name,
    );
    const newState = view.state.apply(transaction);
    view.updateState(newState);
  },
});

/**
 * @since 2021-09-14
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import {
  highlightPlugin,
  history,
  trackPlugin,
  CHANGE_TYPES,
} from '../history';
import { exampleSetup } from 'prosemirror-example-setup';
import { liftTarget } from 'prosemirror-transform';

let state = null;

function resetState() {
  state = EditorState.create({
    schema,
    plugins: [...exampleSetup({ schema }), trackPlugin, highlightPlugin],
    doc: schema.node('doc', {}, [
      schema.node('paragraph', {}, [schema.text('1234567890')]),
    ]),
  });
  history.reset();
}

function insertText(pos, content) {
  state = state.apply(state.tr.insertText(content, pos));
}

function removeText(pos, length) {
  state = state.apply(state.tr.delete(pos, pos + length));
}

function insertNode(pos, node) {
  state = state.apply(state.tr.insert(pos, schema.node(node)));
}

function removeNode(pos) {
  const node = state.doc.resolve(pos).node().content.content[0];
  state = state.apply(state.tr.delete(pos, pos + node.nodeSize));
}

function addMark(from, to, markType) {
  state = state.apply(state.tr.addMark(from, to, schema.mark(markType)));
}

function removeMark(from, to, markType) {
  state = state.apply(state.tr.removeMark(from, to, schema.marks[markType]));
}

function wrap(pos, wrapperNodeType) {
  const $from = state.doc.resolve(pos);
  const node = $from.node().content.content[0];
  const $to = state.doc.resolve(pos + node.nodeSize);
  const nodeRange = $from.blockRange($to);
  state = state.apply(
    state.tr.wrap(nodeRange, [{ type: schema.nodes[wrapperNodeType] }]),
  );
}

function lift(pos) {
  const $from = state.doc.resolve(pos);
  const node = $from.node().content.content[0];
  const $to = state.doc.resolve(pos + node.nodeSize);
  const nodeRange = $from.blockRange($to);
  const target = liftTarget(nodeRange);
  state = state.apply(state.tr.lift(nodeRange, target));
}

function split(pos) {
  state = state.apply(state.tr.split(pos));
}

function join(pos) {
  state = state.apply(state.tr.join(pos));
}

function commit(message = 'No message') {
  state = state.apply(state.tr.setMeta(trackPlugin, message));
}

beforeEach(resetState);

function getDecorations() {
  return highlightPlugin
    .getState(state)
    .decorationSet.find()
    .map(function (decoration) {
      return {
        from: decoration.from,
        to: decoration.to,
        type: decoration.type.attrs.class,
      };
    });
}

describe('inline actions', function () {
  test('insert', function () {
    insertText(1, 'A');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("A1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });

  test('delete', function () {
    removeText(1, 1);
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.DELETE_CONTENT,
      },
    ]);
  });

  test('add mark', function () {
    addMark(1, 2, 'em');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph(em("1"), "234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.UPDATE_STYLE,
      },
    ]);
  });

  test('remove mark', function () {
    addMark(1, 2, 'em');
    commit();
    removeMark(1, 2, 'em');
    commit();
    state = history.createEditorStateByCommitId(1);
    expect(state.doc.toString()).toBe('doc(paragraph("1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.UPDATE_STYLE,
      },
    ]);
  });
});

describe('node actions', function () {
  test('insert node', function () {
    insertNode(0, 'horizontal_rule');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe(
      'doc(horizontal_rule, paragraph("1234567890"))',
    );
    expect(getDecorations()).toStrictEqual([
      {
        from: 0,
        to: 1,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });

  test('delete node', function () {
    insertNode(0, 'horizontal_rule');
    commit();
    removeNode(0);
    commit();
    state = history.createEditorStateByCommitId(1);
    expect(state.doc.toString()).toBe(
      'doc(horizontal_rule, paragraph("1234567890"))',
    );
    expect(getDecorations()).toStrictEqual([
      {
        from: 0,
        to: 1,
        type: CHANGE_TYPES.DELETE_CONTENT,
      },
    ]);
  });

  test('wrap', function () {
    wrap(0, 'blockquote');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe(
      'doc(paragraph("1234567890"), blockquote(paragraph("1234567890")))',
    );
    expect(getDecorations()).toStrictEqual([
      {
        from: 0,
        to: 12,
        type: CHANGE_TYPES.DELETE_CONTENT,
      },
      {
        from: 12,
        to: 26,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });

  test('unwrap', function () {
    wrap(0, 'blockquote');
    commit();
    lift(1);
    commit();
    state = history.createEditorStateByCommitId(1);
    expect(state.doc.toString()).toBe(
      'doc(blockquote(paragraph("1234567890")), paragraph("1234567890"))',
    );
    expect(getDecorations()).toStrictEqual([
      {
        from: 0,
        to: 14,
        type: CHANGE_TYPES.DELETE_CONTENT,
      },
      {
        from: 14,
        to: 26,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });
});

describe('sequence actions', function () {
  test('insert', function () {
    insertText(1, 'A');
    insertText(3, 'B');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("A1B234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
      {
        from: 3,
        to: 4,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });

  test('delete', function () {
    removeText(1, 1);
    insertText(2, 'A');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("12A34567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.DELETE_CONTENT,
      },
      {
        from: 3,
        to: 4,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });
});

describe('sequence content actions', function () {
  test('insert', function () {
    insertText(1, 'AB');
    insertText(2, 'X');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("AXB1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 4,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
      {
        from: 2,
        to: 3,
        type: CHANGE_TYPES.INSERT_CONTENT,
      },
    ]);
  });
});

describe('split', function () {
  test('split paragraph', function () {
    split(11);
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe(
      'doc(paragraph("1234567890"), paragraph)',
    );
    expect(getDecorations()).toStrictEqual([]);
  });
});

describe('join', function () {
  test('join paragraph', function () {
    split(11);
    expect(state.doc.toString()).toBe(
      'doc(paragraph("1234567890"), paragraph)',
    );
    commit();
    join(12, 2);
    commit();
    state = history.createEditorStateByCommitId(1);
    expect(state.doc.toString()).toBe('doc(paragraph("1234567890"))');
    expect(getDecorations()).toStrictEqual([]);
  });
});

describe('special cases', function () {
  test('insert between delete', function () {
    insertText(2, 'A');
    removeText(1, 3);
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 3,
        type: CHANGE_TYPES.DELETE_CONTENT,
      },
    ]);
  });
});

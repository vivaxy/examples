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

function insert(pos, content) {
  state = state.apply(state.tr.insertText(content, pos));
}

function remove(pos, length) {
  state = state.apply(state.tr.delete(pos, pos + length));
}

function addMark(from, to, markType) {
  state = state.apply(state.tr.addMark(from, to, schema.mark(markType)));
}

function removeMark(from, to, markType) {
  state = state.apply(state.tr.removeMark(from, to, schema.marks[markType]));
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
    insert(1, 'A');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("A1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.INSERT,
      },
    ]);
  });

  test('delete', function () {
    remove(1, 1);
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.DELETE,
      },
    ]);
  });

  test('add mark', function () {
    addMark(1, 2, 'em');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe(
      'doc(paragraph("1", em("1"), "234567890"))',
    );
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.MODIFY_DELETE,
      },
      {
        from: 2,
        to: 3,
        type: CHANGE_TYPES.MODIFY_INSERT,
      },
    ]);
  });

  test('remove mark', function () {
    addMark(1, 2, 'em');
    commit();
    removeMark(1, 2, 'em');
    commit();
    state = history.createEditorStateByCommitId(1);
    expect(state.doc.toString()).toBe('doc(paragraph(em("1"), "1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.MODIFY_DELETE,
      },
      {
        from: 2,
        to: 3,
        type: CHANGE_TYPES.MODIFY_INSERT,
      },
    ]);
  });
});

describe('node actions', function () {
  /**
   * TODO:
   *  - addNode
   *  - removeNode
   *  - replaceAroundNode
   */
});

describe('sequence actions', function () {
  test('insert', function () {
    insert(1, 'A');
    insert(3, 'B');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("A1B234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.INSERT,
      },
      {
        from: 3,
        to: 4,
        type: CHANGE_TYPES.INSERT,
      },
    ]);
  });

  test('delete', function () {
    remove(1, 1);
    insert(2, 'A');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("12A34567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 2,
        type: CHANGE_TYPES.DELETE,
      },
      {
        from: 3,
        to: 4,
        type: CHANGE_TYPES.INSERT,
      },
    ]);
  });
});

describe('sequence content actions', function () {
  test('insert', function () {
    insert(1, 'AB');
    insert(2, 'X');
    commit();
    state = history.createEditorStateByCommitId(0);
    expect(state.doc.toString()).toBe('doc(paragraph("AXB1234567890"))');
    expect(getDecorations()).toStrictEqual([
      {
        from: 1,
        to: 4,
        type: CHANGE_TYPES.INSERT,
      },
      {
        from: 2,
        to: 3,
        type: CHANGE_TYPES.INSERT,
      },
    ]);
  });
});

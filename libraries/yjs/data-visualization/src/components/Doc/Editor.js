/**
 * @since 2021-06-26
 * @author vivaxy
 */
import { useRef, useEffect } from 'react';
import * as EDIT_TYPES from '../../enums/edit-types';
import * as Y_DOC_KEYS from '../../enums/y-doc-keys';
import './Editor.css';

function getDiffStart(prev, cur, cursorPos) {
  const max = Math.min(
    Math.max(prev.length - 1, 0),
    Math.max(cur.length - 1, 0),
    cursorPos,
  );
  for (let i = 0; i <= max; i++) {
    if (prev[i] !== cur[i]) {
      return i;
    }
  }
  if (prev.length === 0 || cur.length === 0) {
    return 0;
  }
  return max + 1;
}

function getDiffEnd(prev, cur, cursorPos) {
  const max = Math.min(
    Math.max(prev.length - 1, 0),
    Math.max(cur.length - cursorPos, 0),
  );
  for (let i = 0; i <= max; i++) {
    if (prev[prev.length - 1 - i] !== cur[cur.length - 1 - i]) {
      return i;
    }
  }
  return max;
}

function getActionByLengthChange(prev, cur, cursorPos) {
  if (prev.length > cur.length) {
    // delete
    return {
      type: EDIT_TYPES.DELETE,
      pos: cursorPos,
      len: prev.length - cur.length,
    };
  }
  if (prev.length < cur.length) {
    // insert
    const pos = cursorPos - (cur.length - prev.length);
    return {
      type: EDIT_TYPES.INSERT,
      pos,
      str: cur.slice(pos, cursorPos),
    };
  }
  return null;
}

function getActions(prev, cur, cursorPos) {
  // 1. text before cursor is added
  // 2. text after cursor or text before cursor is deleted
  // 3. ignore changes that result in original text
  const diffStart = getDiffStart(prev, cur, cursorPos);
  const diffEnd = getDiffEnd(prev, cur, cursorPos);

  if (
    diffStart + diffEnd > prev.length - 1 ||
    diffStart + diffEnd > cur.length - 1
  ) {
    // diff collapse
    // possible same char
    const action = getActionByLengthChange(prev, cur, cursorPos);
    if (action) {
      return [action];
    }
    return [];
  }

  const deleted = {
    pos: diffStart,
    len: prev.length - diffEnd - diffStart,
  };
  const inserted = {
    pos: diffStart,
    str: cur.slice(diffStart, cur.length - diffEnd),
  };
  const actions = [];
  if (deleted.len) {
    actions.push({
      type: EDIT_TYPES.DELETE,
      pos: deleted.pos,
      len: deleted.len,
    });
  }
  if (inserted.str.length) {
    actions.push({
      type: EDIT_TYPES.INSERT,
      pos: inserted.pos,
      str: inserted.str,
    });
  }
  return actions;
}

function getTextFromYDoc(yDoc) {
  return yDoc.getText(Y_DOC_KEYS.TEXT_KEY).toString();
}

export default function Editor(props) {
  const editorRef = useRef(null);
  const editorValue = useRef(getTextFromYDoc(props.doc.yDoc));

  function handleInput(e) {
    const value = e.target.textContent;
    if (editorValue.current !== value) {
      const cursorPos = window.getSelection().getRangeAt(0).startOffset;
      const actions = getActions(editorValue.current, value, cursorPos);
      if (actions.length) {
        editorValue.current = value;
        props.onEditorChange({
          id: props.doc.id,
          actions,
        });
      }
    }
  }

  useEffect(function () {
    const text = getTextFromYDoc(props.doc.yDoc);
    if (editorRef.current.textContent !== text) {
      editorRef.current.textContent = text;
    }
    if (editorValue.current !== text) {
      editorValue.current = text;
    }
  });

  return (
    <p
      contentEditable={props.editable ? 'true' : 'false'}
      className="editor"
      onInput={handleInput}
      ref={editorRef}
    />
  );
}

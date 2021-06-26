/**
 * @since 2021-06-26
 * @author vivaxy
 */
import { useRef, useEffect } from 'react';
import * as EDIT_TYPES from '../../enums/edit-types';
import * as Y_DOC_KEYS from '../../enums/y-doc-keys';
import './Editor.css';

function getChanges(prev, cur, cursorPos) {
  if (cur.length > prev.length) {
    return {
      type: EDIT_TYPES.INSERT,
      pos: cursorPos - cur.length + prev.length,
      str: cur.slice(cursorPos - cur.length + prev.length, cursorPos),
    };
  }
  if (cur.length < prev.length) {
    return {
      type: EDIT_TYPES.DELETE,
      pos: cursorPos,
      len: prev.length - cur.length,
    };
  }
  throw new Error('Unexpected change');
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
      const change = getChanges(editorValue.current, value, cursorPos);
      editorValue.current = value;
      props.onEditorChange({
        id: props.doc.id,
        ...change,
      });
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

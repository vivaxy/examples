/**
 * @since 2021-06-25
 * @author vivaxy
 */
import { useRef, useEffect } from 'react';
import YDocModel from './Doc/YDocModel';
import './Doc.css';
import * as EDIT_TYPES from '../enums/edit-types';
import * as Y_DOC_KEYS from '../enums/y-doc-keys';

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

function stringifyAction(action) {
  return `${action.type} ${action.pos} ${action.str || action.len}`;
}

function getTextFromYDoc(yDoc) {
  return yDoc.getText(Y_DOC_KEYS.TEXT_KEY).toString();
}

export default function Doc(props) {
  const editorRef = useRef(null);
  const editorValue = useRef(getTextFromYDoc(props.doc.yDoc));

  function handleCloseDoc() {
    props.onCloseDoc(props.doc);
  }

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

  function createHandleSync(toDocId, update) {
    return function handleSync() {
      props.onSync({ fromDocId: props.doc.id, toDocId, update });
    };
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
    <div className="doc-container">
      <div className="doc-tab">
        <p className="doc-id">Doc{props.doc.id}</p>
        <button className="doc-close" onClick={handleCloseDoc}>
          x
        </button>
      </div>
      <p
        contentEditable="true"
        className="editor"
        onInput={handleInput}
        ref={editorRef}
      />
      <div className="updates">
        {props.doc.updates.map(function (update, index) {
          return (
            <p className="update" key={index + stringifyAction(update.action)}>
              <span
                className={`update-detail${
                  update.action.type === EDIT_TYPES.INSERT
                    ? ' insert'
                    : ' delete'
                }`}
              >
                {stringifyAction(update.action)}
              </span>
              {props.docs
                .filter(function (doc) {
                  return doc.id !== props.doc.id;
                })
                .map(function (doc) {
                  return (
                    <button
                      className="sync-button"
                      key={doc.id}
                      onClick={createHandleSync(doc.id, update)}
                    >
                      To Doc{doc.id}
                    </button>
                  );
                })}
            </p>
          );
        })}
      </div>
      <YDocModel yDoc={props.doc.yDoc} />
    </div>
  );
}

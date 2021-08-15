/**
 * @since 2021-06-25
 * @author vivaxy
 */
import Tab from './Tab';
import Editor from './Editor';
import Updates from './Updates';
import Index from './YDocModel';
import './index.css';

export default function Doc(props) {
  function isFocusedClientId(clientID) {
    const doc = props.getDocByClientId(clientID);
    return doc?.id === props.focusedDocId;
  }

  return (
    <div className="doc-container" onClick={props.onFocus}>
      <Tab
        doc={props.doc}
        onCloseDoc={props.onCloseDoc}
        editable={props.editable}
      />
      <Editor
        doc={props.doc}
        onEditorChange={props.onEditorChange}
        editable={props.editable}
        focused={isFocusedClientId(props.doc.yDoc.clientID)}
      />
      <Updates
        doc={props.doc}
        docs={props.docs}
        onSync={props.onSync}
        editable={props.editable}
      />
      <Index
        yDoc={props.doc.yDoc}
        dataSource={props.dataSource}
        getDocByClientId={props.getDocByClientId}
        isFocusedClientId={isFocusedClientId}
      />
    </div>
  );
}

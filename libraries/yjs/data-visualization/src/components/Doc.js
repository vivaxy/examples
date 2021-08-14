/**
 * @since 2021-06-25
 * @author vivaxy
 */
import Tab from './Doc/Tab';
import Editor from './Doc/Editor';
import Updates from './Doc/Updates';
import YDocModel from './Doc/YDocModel';
import './Doc.css';

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
      <YDocModel
        yDoc={props.doc.yDoc}
        dataSource={props.dataSource}
        getDocByClientId={props.getDocByClientId}
        isFocusedClientId={isFocusedClientId}
      />
    </div>
  );
}

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
  return (
    <div className="doc-container">
      <Tab
        doc={props.doc}
        onCloseDoc={props.onCloseDoc}
        editable={props.editable}
      />
      <Editor
        doc={props.doc}
        onEditorChange={props.onEditorChange}
        editable={props.editable}
      />
      <Updates
        doc={props.doc}
        docs={props.docs}
        onSync={props.onSync}
        editable={props.editable}
      />
      <YDocModel yDoc={props.doc.yDoc} />
    </div>
  );
}

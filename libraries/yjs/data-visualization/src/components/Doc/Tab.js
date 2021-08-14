/**
 * @since 2021-06-26
 * @author vivaxy
 */
import './Tab.css';

export default function Tab(props) {
  function handleCloseDoc() {
    props.onCloseDoc(props.doc);
  }

  return (
    <div className="doc-tab">
      {props.editable && (
        <button className="doc-close" onClick={handleCloseDoc}>
          x
        </button>
      )}
      <p className="doc-id">Doc{props.doc.id}</p>
      <span className="doc-options">
        {props.doc.yDoc.gc && <span>GC✔️</span>}
        {props.doc.pud && <span>PermanentUserData✔️</span>}
      </span>
    </div>
  );
}

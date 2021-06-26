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
      <p className="doc-id">Doc{props.doc.id}</p>
      <button className="doc-close" onClick={handleCloseDoc}>
        x
      </button>
    </div>
  );
}

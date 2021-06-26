/**
 * @since 2021-06-26
 * @author vivaxy
 */
import * as EDIT_TYPES from '../../enums/edit-types';
import './Updates.css';

function stringifyAction(action) {
  return `${action.type} ${action.pos} ${action.str || action.len}`;
}

export default function Updates(props) {
  function createHandleSync(to, index) {
    return function handleSync() {
      props.onSync({ from: props.doc.id, to, index });
    };
  }

  return (
    <div className="updates">
      {props.doc.updates.map(function (update, index) {
        return (
          <p className="update" key={index + stringifyAction(update.action)}>
            <span
              className={`update-detail${
                update.action.type === EDIT_TYPES.INSERT ? ' insert' : ' delete'
              }`}
            >
              {stringifyAction(update.action)}
            </span>
            {props.editable &&
              props.docs
                .filter(function (doc) {
                  return doc && doc.id !== props.doc.id;
                })
                .map(function (doc) {
                  return (
                    <button
                      className="sync-button"
                      key={doc.id}
                      onClick={createHandleSync(doc.id, index)}
                    >
                      To Doc{doc.id}
                    </button>
                  );
                })}
          </p>
        );
      })}
    </div>
  );
}

/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as Y from 'yjs';
import './YDocModel.css';
import { TEXT_KEY } from '../../enums/y-doc-keys';

function getSharedTypeId(sharedType) {
  return `${sharedType.id.client} ${sharedType.id.clock}`;
}

function renderMissing(missing) {
  const res = [];
  missing.forEach(function (value, clientID) {
    res.push(
      <p key={clientID}>
        <span className="client-id">{clientID}:</span>
        <span>{value}</span>
      </p>,
    );
  });
  return res;
}

function renderTextModel(item, clientID) {
  if (!item) {
    return [];
  }
  const sharedTypeNode = (
    <div
      className={`item${item.content.str ? ' insert' : ' delete'}${
        item.id.client === clientID ? ' current' : ' link'
      }`}
      key={getSharedTypeId(item)}
    >
      <p className="clock">{item.id.clock}</p>
      <p className="item-value">{item.content.str || item.content.len}</p>
    </div>
  );

  return [sharedTypeNode, ...renderTextModel(item.right, clientID)];
}

function renderDeleteSet(yDoc, currentClientID) {
  const children = [];
  const pud = new Y.PermanentUserData(yDoc);
  pud.dss.forEach(function (ds, userDescription) {
    const userDes = pud.clients.get(currentClientID);
    if (userDes === userDescription) {
      ds.clients.forEach(function (deleteItems, clientID) {
        deleteItems.forEach(function (deleteItem) {
          children.push(
            <div
              key={`${clientID}-${deleteItem.clock}`}
              className="item delete"
            >
              <p className="clock">{deleteItem.clock}</p>
              <p className="item-value">{deleteItem.len}</p>
            </div>,
          );
        });
      });
    }
  });

  return children;
}

export default function YDocModel(props) {
  const children = [];
  props.yDoc.store.clients.forEach(function (_, clientID) {
    children.push(
      <div className="client" key={clientID}>
        <p className="client-id">clientID: {clientID}</p>
        <p className="label">Text:</p>
        <div className="client-text">
          {renderTextModel(props.yDoc.getText(TEXT_KEY)._start, clientID)}
        </div>
        <p className="label">DeleteSet:</p>
        <div className="pud">{renderDeleteSet(props.yDoc, clientID)}</div>
      </div>,
    );
  });

  return (
    <div className="y-doc-model">
      {props.yDoc.store.pendingStructs && (
        <div className="pending-structs">
          <p>missing:</p>
          {renderMissing(props.yDoc.store.pendingStructs.missing)}
        </div>
      )}
      <div className="clients">{children}</div>
    </div>
  );
}

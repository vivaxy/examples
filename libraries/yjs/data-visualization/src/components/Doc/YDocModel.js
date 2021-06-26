/**
 * @since 2021-06-25
 * @author vivaxy
 */
import './YDocModel.css';

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

function renderModel(sharedType, clientID) {
  const sharedTypeNode = (
    <div
      className={`shared-type${sharedType.content.str ? ' insert' : ' delete'}${
        sharedType.id.client === clientID ? ' current' : ' link'
      }`}
      key={getSharedTypeId(sharedType)}
    >
      <p className="clock">{sharedType.id.clock}</p>
      <p className="shared-type-value">
        {sharedType.content.str || sharedType.content.len}
      </p>
    </div>
  );

  if (sharedType.right) {
    return [sharedTypeNode, ...renderModel(sharedType.right, clientID)];
  }
  return [sharedTypeNode];
}

export default function YDocModel(props) {
  const children = [];
  props.yDoc.store.clients.forEach(function (items, clientID) {
    children.push(
      <div className="client" key={clientID}>
        <p className="client-id">clientID: {clientID}</p>
        <div className="client-model">
          {renderModel(items[0].parent._start, clientID)}
        </div>
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

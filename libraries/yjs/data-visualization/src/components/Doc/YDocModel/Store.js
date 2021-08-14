/**
 * @since 2021-08-14
 * @author vivaxy
 */
import * as Y from 'yjs';

import Struct from './Struct';
import { structToJSON } from '../../../data-viewer';

import './Store.css';

function Missing(props) {
  const { missing } = props;
  return missing.map(function (value, clientID) {
    return (
      <p key={clientID}>
        <span className="client-id">{clientID}:</span>
        <span>{value}</span>
      </p>
    );
  });
}

function Clients(props) {
  return Array.from(props.clients.keys()).map(function (clientID) {
    return (
      <div className="client-container" key={clientID}>
        <div className="client-id">clientID: {clientID}</div>
        <div className="client-structs">
          {props.clients.get(clientID).map(function (_struct) {
            const struct = structToJSON(_struct, Y);
            return (
              <Struct
                key={`${struct.client}-${struct.clock}`}
                struct={struct}
                isFocusedClientId={props.isFocusedClientId}
                getDocByClientId={props.getDocByClientId}
              />
            );
          })}
        </div>
      </div>
    );
  });
}

export default function Store(props) {
  return (
    <div className="data-source-store">
      {props.yDoc.store.pendingStructs && (
        <div className="pending-structs">
          <p>Missing:</p>
          <Missing missing={props.yDoc.store.pendingStructs.missing} />
        </div>
      )}
      <Clients
        clients={props.yDoc.store.clients}
        isFocusedClientId={props.isFocusedClientId}
        getDocByClientId={props.getDocByClientId}
      />
    </div>
  );
}

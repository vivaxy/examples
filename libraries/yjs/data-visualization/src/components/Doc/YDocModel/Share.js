/**
 * @since 2021-08-14
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../../../data-viewer';
import Struct from './Struct';

import './Share.css';

function AbstractType(props) {
  const value = toJSON(props.value, Y);
  // TODO process other value type
  if (!Array.isArray(value)) {
    return <div className="abstract-type">AbstractType not supported.</div>;
  }
  return (
    <div className="abstract-type">
      <div className="abstract-type-name">{props.name}:</div>
      <div className="abstract-type-value">
        {value.map(function (struct) {
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
}

export default function Share(props) {
  const keys = Array.from(props.yDoc.share.keys());
  return (
    <div className="data-source-share">
      {keys.map(function (name) {
        return (
          <AbstractType
            key={name}
            name={name}
            value={props.yDoc.share.get(name)}
            getDocByClientId={props.getDocByClientId}
            isFocusedClientId={props.isFocusedClientId}
          />
        );
      })}
    </div>
  );
}

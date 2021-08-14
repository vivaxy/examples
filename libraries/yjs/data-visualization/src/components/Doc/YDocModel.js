/**
 * @since 2021-06-25
 * @author vivaxy
 */
import { DATA_SOURCES } from '../../enums/view-options';
import Share from './YDocModel/Share';
import Store from './YDocModel/Store';

import './YDocModel.css';

export default function YDocModel(props) {
  return (
    <div className="y-doc-model">
      {props.dataSource === DATA_SOURCES.SHARE ? (
        <Share
          yDoc={props.yDoc}
          getDocByClientId={props.getDocByClientId}
          isFocusedClientId={props.isFocusedClientId}
        />
      ) : (
        <Store
          yDoc={props.yDoc}
          getDocByClientId={props.getDocByClientId}
          isFocusedClientId={props.isFocusedClientId}
        />
      )}
    </div>
  );
}

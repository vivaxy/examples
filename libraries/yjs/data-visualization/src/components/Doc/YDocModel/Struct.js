/**
 * @since 2021-08-14
 * @author vivaxy
 */
import { DATA_TYPES } from '../../../data-viewer';

import './Struct.css';

const contentRenderers = {
  [DATA_TYPES.CONTENT_STRING](content) {
    return <div className="string">{content.string}</div>;
  },
  [DATA_TYPES.CONTENT_DELETED](content) {
    return <div className="length">{content.length}</div>;
  },
  [DATA_TYPES.CONTENT_TYPE](content) {
    return <div className="content-type">{content.value.type}</div>;
  },
  [DATA_TYPES.CONTENT_ANY](content) {
    return <div className="content-any">{content.value}</div>;
  },
  [DATA_TYPES.CONTENT_BINARY]() {
    return <div className="content-binary">Binary</div>;
  },
};

function unsupportedContentType(content) {
  return <div>Unsupported content type: {content.type}</div>;
}

export default function Struct(props) {
  const { content, deleted, client, clock } = props.struct;
  return (
    <div
      className={`struct ${content.type} ${
        deleted || content.type === DATA_TYPES.CONTENT_DELETED ? 'deleted' : ''
      } ${props.isFocusedClientId(client) ? 'focused' : ''}`}
    >
      <div className="client">Doc{props.getDocByClientId(client)?.id}</div>
      <div className="clock">{clock}</div>
      {(contentRenderers[content.type] || unsupportedContentType)(content)}
    </div>
  );
}

/**
 * @since 2021-08-14
 * @author vivaxy
 */
import './Struct.css';

const typeRenderers = {
  ContentString(struct) {
    return (
      <>
        <div className="str">{struct.str}</div>
      </>
    );
  },
  ContentDeleted(struct) {
    return (
      <>
        <div className="len">{struct.len}</div>
      </>
    );
  },
};

function unsupportedStructType(struct) {
  return <div>Unsupported struct type: {struct.type}</div>;
}

export default function Struct(props) {
  const { struct } = props;
  return (
    <div
      className={`struct ${struct.type} ${
        struct.deleted || struct.type === 'ContentDeleted' ? 'deleted' : ''
      } ${props.isFocusedClientId(struct.client) ? 'focused' : ''}`}
    >
      <div className="client">
        Doc{props.getDocByClientId(struct.client)?.id}
      </div>
      <div className="clock">{struct.clock}</div>
      {(typeRenderers[struct.type] || unsupportedStructType)(struct)}
    </div>
  );
}

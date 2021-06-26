/**
 * @since 2021-06-25
 * @author vivaxy
 */
import './Actions.css';

export default function Actions(props) {
  return (
    <div className="actions">
      <span>Actions: </span>
      <button onClick={props.onOpenDoc}>Open a new doc</button>
    </div>
  );
}

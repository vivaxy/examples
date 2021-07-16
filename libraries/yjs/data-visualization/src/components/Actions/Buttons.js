/**
 * @since 2021-06-25
 * @author vivaxy
 */
export default function Buttons(props) {
  function handleOpenDoc() {
    props.onOpenDoc();
  }

  return (
    <span className="buttons-container">
      <span>Actions: </span>
      <button onClick={handleOpenDoc}>Open a new doc</button>
    </span>
  );
}

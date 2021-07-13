/**
 * @since 2021-07-13
 * @author vivaxy
 */
const IDS = {
  GC: 'option-gc',
};

function DEFAULT_GET_VALUE(e) {
  return e.target.value;
}

export default function Options(props) {
  function createHandleChange(key, getValue = DEFAULT_GET_VALUE) {
    return function handleChange(e) {
      props.onOptionChange({
        [key]: getValue(e),
      });
    };
  }

  return (
    <div className="options-container">
      <label htmlFor={IDS.GC}>GC:</label>
      <input
        id={IDS.GC}
        type="checkbox"
        checked={props.options.gc}
        onChange={createHandleChange('gc', function (e) {
          return e.target.checked;
        })}
      />
    </div>
  );
}

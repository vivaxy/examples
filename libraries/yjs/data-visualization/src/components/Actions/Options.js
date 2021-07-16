/**
 * @since 2021-07-16
 * @author vivaxy
 */
import './Options.css';

const IDS = {
  GC: 'option-gc',
  PUD: 'option-pud',
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
    <span className="options-container">
      <label htmlFor={IDS.GC}>GC:</label>
      <input
        id={IDS.GC}
        type="checkbox"
        disabled={props.disabled}
        checked={props.options.gc}
        onChange={createHandleChange('gc', function (e) {
          return e.target.checked;
        })}
      />
      <label htmlFor={IDS.PUD}>PermanentUserData:</label>
      <input
        id={IDS.PUD}
        type="checkbox"
        disabled={props.disabled}
        checked={props.options.pud}
        onChange={createHandleChange('pud', function (e) {
          return e.target.checked;
        })}
      />
    </span>
  );
}

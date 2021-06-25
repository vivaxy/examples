/**
 * @since 2021-06-25
 * @author vivaxy
 */
export default function Scenarios(props) {
  const SCENARIOS_ID = 'scenarios';

  function handleChange(e) {
    if (e.target.value !== props.currentScenario) {
      props.onScenarioChange(e.target.value);
    }
  }

  function handleClick() {
    props.onNextStep();
  }

  return (
    <div className="scenarios">
      <label htmlFor={SCENARIOS_ID}>Scenarios:</label>
      <select id={SCENARIOS_ID} onChange={handleChange}>
        {Object.keys(props.scenarios).map(function (scenario) {
          return (
            <option key={scenario} value={scenario}>
              {scenario}
            </option>
          );
        })}
      </select>
      <button disabled={!props.hasNextStep} onClick={handleClick}>
        Next step
      </button>
    </div>
  );
}

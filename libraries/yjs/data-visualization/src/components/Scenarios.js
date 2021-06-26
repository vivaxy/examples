/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as ENUMS from '../enums/enums';
import Actions from './Scenarios/Actions';
import * as E from '../enums/event-types';
import * as EDIT_TYPE from '../enums/edit-types';

import './Scenarios.css';

function stringifyStep(step) {
  const [action, payload] = step;
  switch (action) {
    case E.DOC_OPEN:
      return action;
    case E.DOC_UPDATE:
      if (payload.type === EDIT_TYPE.INSERT) {
        return `${action} Doc:${payload.id} type:${payload.type} pos:${payload.pos} str:${payload.str}`;
      }
      if (payload.type === EDIT_TYPE.DELETE) {
        return `${action} Doc:${payload.id} type:${payload.type} pos:${payload.pos} len:${payload.len}`;
      }
      throw new Error('Unexpect edit type: ' + payload.type);
    case E.DOC_SYNC:
      if (payload.index === undefined) {
        return `${action} FromDoc:${payload.from} ToDoc:${payload.to}`;
      }
      return `${action} FromDoc:${payload.from} ToDoc:${payload.to} updateIndex:${payload.index}`;
    case E.DOC_CLOSE:
      return action;
    default:
      throw new Error('Expected action: ' + action);
  }
}

export default function Scenarios(props) {
  const SCENARIOS_ID = 'scenarios';

  function handleChange(e) {
    if (e.target.value !== props.currentScenario) {
      props.onScenarioChange(e.target.value);
    }
  }

  function handleClick() {
    const currentScenarioSteps = props.scenarios[props.currentScenario];
    if (props.currentScenarioStepIndex < currentScenarioSteps.length) {
      props.onNextStep();
    } else {
      props.onRestartStep();
    }
  }

  function handleOpenDoc() {
    props.onOpenDoc();
  }

  const currentScenarioSteps = props.scenarios[props.currentScenario];

  const currentStep =
    currentScenarioSteps &&
    currentScenarioSteps[props.currentScenarioStepIndex - 1];

  const nextStep =
    currentScenarioSteps &&
    currentScenarioSteps[props.currentScenarioStepIndex];

  return (
    <div className="scenarios">
      <label htmlFor={SCENARIOS_ID}>Scenarios: </label>
      <select id={SCENARIOS_ID} onChange={handleChange}>
        <option value={ENUMS.CUSTOM_SCENARIO}>Custom</option>
        {Object.keys(props.scenarios).map(function (scenario) {
          return (
            <option key={scenario} value={scenario}>
              {scenario}
            </option>
          );
        })}
      </select>
      {currentScenarioSteps && (
        <button
          disabled={props.currentScenario === ENUMS.CUSTOM_SCENARIO}
          onClick={handleClick}
          className="next-step-button"
        >
          {nextStep ? 'Next step' : 'Restart'}
        </button>
      )}
      {nextStep && <span className="next-step">{stringifyStep(nextStep)}</span>}
      {currentStep && (
        <p className="current-step">
          <span className="current-step-label">Current step: </span>
          <span>{stringifyStep(currentStep)}</span>
        </p>
      )}
      {!currentScenarioSteps && <Actions onOpenDoc={handleOpenDoc} />}
    </div>
  );
}

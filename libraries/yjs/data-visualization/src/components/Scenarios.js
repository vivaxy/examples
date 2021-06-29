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
  const [event, payload] = step;
  switch (event) {
    case E.DOC_OPEN:
      return event;
    case E.DOC_UPDATE:
      const { id, actions } = payload;
      return actions
        .map(function (action) {
          if (action.type === EDIT_TYPE.INSERT) {
            return `${event} Doc:${id} type:${action.type} pos:${action.pos} str:${action.str}`;
          }
          if (action.type === EDIT_TYPE.DELETE) {
            return `${event} Doc:${id} type:${action.type} pos:${action.pos} len:${action.len}`;
          }
          throw new Error('Unexpect edit type: ' + action.type);
        })
        .join(' ; ');
    case E.DOC_SYNC:
      if (payload.index === undefined) {
        return `${event} FromDoc:${payload.from} ToDoc:${payload.to}`;
      }
      return `${event} FromDoc:${payload.from} ToDoc:${payload.to} updateIndex:${payload.index}`;
    case E.DOC_CLOSE:
      return event;
    default:
      throw new Error('Expected action: ' + event);
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

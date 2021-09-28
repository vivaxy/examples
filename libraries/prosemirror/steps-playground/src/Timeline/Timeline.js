/**
 * @since 2021-09-28
 * @author vivaxy
 */
import React from 'react';
import './Timeline.css';

function StepType(step) {
  return <div className="step-type">{step.stepType}</div>;
}

function StepPosition(step) {
  return (
    <div className="step-row">
      <span className="step-key">Position</span>
      <span className="step-value">
        {step.from}, {step.to}
      </span>
    </div>
  );
}

function StepOpen(step) {
  return (
    <div className="step-row">
      <span className="step-key">Open</span>
      <span className="step-value">
        {step.openStart}, {step.openEnd}
      </span>
    </div>
  );
}

function StepSlice(step) {
  return <div className="step-slice">{step.slice}</div>;
}

function StepStructure(step) {
  return (
    <div className="step-row">
      <span className="step-key">Structure</span>
      <span className="step-value">{step.structure ? '✔︎' : '✗'}</span>
    </div>
  );
}

function StepMark(step) {
  return <div className="step-mark">{step.mark}</div>;
}

function ReplaceStep(step, key) {
  return (
    <div key={key} className="step">
      <StepType {...step} />
      <StepPosition {...step} />
      <StepOpen {...step} />
      <StepStructure {...step} />
      <StepSlice {...step} />
    </div>
  );
}

function ReplaceAroundStep(step, key) {
  return (
    <div key={key} className="step">
      <StepType {...step} />
      <StepPosition {...step} />
      <StepOpen {...step} />
      <StepStructure {...step} />
      <StepSlice {...step} />
    </div>
  );
}

function AddMarkStep(step, key) {
  return (
    <div key={key} className="step">
      <StepType {...step} />
      <StepPosition {...step} />
      <StepMark {...step} />
    </div>
  );
}

function RemoveMarkStep(step, key) {
  return (
    <div key={key} className="step">
      <StepType {...step} />
      <StepPosition {...step} />
      <StepMark {...step} />
    </div>
  );
}

const stepRenderer = {
  replace: ReplaceStep,
  replaceAround: ReplaceAroundStep,
  addMark: AddMarkStep,
  removeMark: RemoveMarkStep,
};

export default function Timeline({ steps }) {
  return (
    <div className="timeline">
      <p>Timeline:</p>
      <div className="steps">
        {steps.map(function (step, i) {
          return stepRenderer[step.stepType](step, i);
        })}
      </div>
    </div>
  );
}

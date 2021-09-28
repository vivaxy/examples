/**
 * @since 2021-09-28
 * @author vivaxy
 */
import React from 'react';
import ReactDOM from 'react-dom';

import Timeline from './Timeline';

let $root = null;

let timeline = {
  steps: [],
};

function render() {
  ReactDOM.render(<Timeline {...timeline} />, $root);
}

export default {
  init({ $root: _$root }) {
    $root = _$root;
    console.assert($root, 'Invalid $root');
    render();
  },
  appendSteps(steps) {
    timeline = {
      ...timeline,
      steps: [...timeline.steps, ...steps],
    };
    render();
  },
  destroy() {
    console.assert($root, 'Invalid $root');
    ReactDOM.render(null, $root);
  },
};

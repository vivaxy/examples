/**
 * @since 2024-02-04
 * @author vivaxy
 */
import {
  createElement,
  createText,
  render,
  // @ts-expect-error remote js
} from 'https://unpkg.com/@vivaxy/framework/ui/render-app.js';
import * as EVENTS from '../enums/events.js';

const STAGE_TEXTS = {
  0: 'Initialize',
  1: 'Build pattern table',
  2: 'Search',
  3: 'Result',
};

/**
 * @param {{ stage: number }} props
 * @returns {*}
 */
function createApp(props) {
  return createElement('h1', {}, [
    createText(`Stage ${props.stage}: ${STAGE_TEXTS[props.stage]}`),
  ]);
}

/**
 * @typedef {import('../utils/types.js').EventEmitter} EventEmitter
 */

/**
 * @param {EventEmitter} events
 */
export function initStage(events) {
  const props = {
    root: document.getElementById('stage'),
    stage: 0,
  };

  events.on(EVENTS.INIT_INFO, function () {
    render(createApp, props, props.root);
  });

  events.on(EVENTS.STAGE, function ({ value }) {
    props.stage = value;
    render(createApp, props, props.root);
  });

  events.on(EVENTS.RESULT, function () {
    props.stage = 3;
    render(createApp, props, props.root);
  });
}

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
  0: 'Target length',
  1: 'Build pattern table',
  2: 'Search',
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
  };

  events.on(EVENTS.STAGE, function ({ value }) {
    props.stage = value;
    render(createApp, props, props.root);
  });
}

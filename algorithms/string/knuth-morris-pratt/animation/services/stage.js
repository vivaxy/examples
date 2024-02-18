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
 * @typedef {{ root: HTMLElement, stage: number }} Props
 */

/**
 * @param {Props} props
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
  /**
   * @type {Props}
   */
  let props = {
    root: document.getElementById('stage'),
    stage: 0,
  };

  /**
   * @param {Props} newProps
   */
  function updateProps(newProps) {
    props = newProps;
    render(createApp, props, props.root);
  }

  events.on(EVENTS.INIT_INFO, function () {
    updateProps(props);
  });

  events.on(EVENTS.STAGE, function ({ value }) {
    updateProps({
      ...props,
      stage: value,
    });
  });

  events.on(EVENTS.RESULT, function () {
    updateProps({
      ...props,
      stage: 3,
    });
  });
}

/**
 * @since 2024-02-16
 * @author vivaxy
 */
import {
  createElement,
  createText,
  render,
  // @ts-expect-error remote js
} from 'https://unpkg.com/@vivaxy/framework/ui/render-app.js';
import * as EVENTS from '../enums/events.js';

/**
 * @typedef {import('../utils/types.js').EventEmitter} EventEmitter
 */

function createApp(props) {
  return createElement('div', {}, [
    createElement('label', {}, [createText('Result: ')]),
    createElement('span', {}, [
      createText(props.result === -1 ? '' : props.result),
    ]),
  ]);
}

/**
 * @param {EventEmitter} events
 */
export function initResult(events) {
  let props = {
    root: document.getElementById('result'),
    result: -1,
  };
  events.on(EVENTS.RESULT, function ({ value }) {
    props = {
      ...props,
      result: value,
    };
    render(createApp, props, props.root);
  });
}

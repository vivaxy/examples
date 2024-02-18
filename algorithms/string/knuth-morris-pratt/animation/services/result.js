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

/**
 * @typedef {{ root: HTMLElement, result: number }} Props
 */

/**
 * @param {Props} props
 * @returns {*}
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
  /**
   * @type {Props}
   */
  let props = {
    root: document.getElementById('result'),
    result: -1,
  };

  /**
   * @param {Props} newProps
   */
  function updateProps(newProps) {
    props = newProps;
    render(createApp, props, props.root);
  }

  events.on(EVENTS.RESULT, function ({ value }) {
    updateProps({
      ...props,
      result: value,
    });
  });
}

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
 * @param {{ text: string, target: string, textIndex: number, targetIndex: number, highlightTarget: boolean }} props
 * @returns {*}
 */
function createApp(props) {
  return createElement('div', {}, [
    createElement('div', { class: 'text' }, [
      createElement('label', {}, [createText('Text: ')]),
      ...props.text.split('').map(function (char) {
        return createElement('span', { class: 'char' }, [createText(char)]);
      }),
    ]),
    createElement('div', { class: 'text-index' }, [
      createElement('label', {}, [createText('Text index: ')]),

      ...props.text.split('').map(function (_, i) {
        return createElement(
          'span',
          { class: `char ${i === props.textIndex ? '' : 'hidden'}` },
          [createText('↑')],
        );
      }),
    ]),
    createElement(
      'div',
      { class: `target ${props.highlightTarget ? 'highlight' : ''}` },
      [
        createElement('label', {}, [createText('Target: ')]),
        ...props.target.split('').map(function (char) {
          return createElement('span', { class: 'char' }, [createText(char)]);
        }),
      ],
    ),
    createElement('div', { class: 'target-index' }, [
      createElement('label', {}, [createText('Target index: ')]),
      ...props.target.split('').map(function (_, i) {
        return createElement(
          'span',
          { class: `char ${i === props.targetIndex ? '' : 'hidden'}` },
          [createText('↑')],
        );
      }),
    ]),
  ]);
}

/**
 * @param {EventEmitter} events
 */
export function initInfo(events) {
  let props = {
    root: document.getElementById('info'),
    text: '',
    target: '',
    textIndex: -1,
    targetIndex: -1,
    highlightTarget: false,
  };

  events.on(EVENTS.INIT_INFO, function ({ text, target }) {
    props = {
      ...props,
      text,
      target,
      highlightTarget: false,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.SET_VALUE, function ({ key, value }) {
    props = {
      ...props,
      [key]: value,
      highlightTarget: false,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.COMPARE, function ({ from }) {
    if (from === 'target[length]') {
      props = {
        ...props,
        highlightTarget: true,
      };
      render(createApp, props, props.root);
    }
  });

  events.on(EVENTS.STAGE, function () {
    props = {
      ...props,
      highlightTarget: false,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.RESULT, function () {
    props = {
      ...props,
      highlightTarget: false,
    };
    render(createApp, props, props.root);
  });
}

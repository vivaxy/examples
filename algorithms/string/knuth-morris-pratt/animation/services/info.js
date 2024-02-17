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
 * @typedef {{
 *  text: string,
 *  target: string,
 *  textIndex: number,
 *  targetIndex: number,
 *  tableIndex: number,
 *  highlightTarget: boolean,
 *  highlightTargetIndex: boolean
 *  highlightTableIndex: boolean
 *  highlightTextIndex: boolean
 *  root: HTMLElement
 * }} Props
 */
/**
 * @param {Props} props
 * @returns {*}
 */
function createApp(props) {
  // console.log('infoProps', props);
  const textSplit = props.text.split('');
  const targetSplit = props.target.split('');
  const highlightText = props.highlightTextIndex
    ? textSplit[props.textIndex]
    : null;
  const highlightTarget = props.highlightTargetIndex
    ? targetSplit[props.targetIndex]
    : null;
  const highlightTable = props.highlightTableIndex
    ? targetSplit[props.tableIndex]
    : null;
  const highlightClass =
    highlightText === highlightTarget || highlightTarget === highlightTable
      ? 'highlight-same'
      : 'highlight';
  return createElement('div', {}, [
    createElement('div', { class: 'text' }, [
      createElement('label', {}, [createText('Text: ')]),
      ...textSplit.map(function (char, i) {
        return createElement(
          'span',
          {
            class: `char ${
              props.highlightTextIndex && i === props.textIndex
                ? highlightClass
                : ''
            }`,
          },
          [createText(char)],
        );
      }),
    ]),
    createElement('div', { class: 'text-index' }, [
      createElement('label', {}, [createText('Text index: ')]),
      ...textSplit.map(function (_, i) {
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
        ...targetSplit.map(function (char, i) {
          return createElement(
            'span',
            {
              class: `char ${
                (props.highlightTargetIndex && i === props.targetIndex) ||
                (props.highlightTableIndex && i === props.tableIndex)
                  ? highlightClass
                  : ''
              }`,
            },
            [createText(char)],
          );
        }),
      ],
    ),
    createElement('div', { class: 'target-index' }, [
      createElement('label', {}, [createText('Target index: ')]),
      ...targetSplit.map(function (_, i) {
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
 * @param {Props} props
 */
function resetHighlight(props) {
  props = {
    ...props,
    highlightTarget: false,
    highlightTargetIndex: false,
    highlightTableIndex: false,
    highlightTextIndex: false,
  };
  render(createApp, props, props.root);
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
    tableIndex: -1,
    highlightTarget: false,
    highlightTargetIndex: false,
    highlightTableIndex: false,
    highlightTextIndex: false,
  };

  events.on(EVENTS.INIT_INFO, function ({ text, target }) {
    props = {
      ...props,
      text,
      target,
      highlightTarget: false,
      highlightTargetIndex: false,
      highlightTableIndex: false,
      highlightTextIndex: false,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.SET_VALUE, function ({ key, value }) {
    if (key === 'patternTable[tableIndex]') {
      return;
    }
    props = {
      ...props,
      [key]: value,
      highlightTarget: false,
      highlightTargetIndex: false,
      highlightTableIndex: false,
      highlightTextIndex: false,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.COMPARE, function ({ from, to }) {
    const highlightTarget = from === 'target[length]';
    const highlightTargetIndex = to === 'target[targetIndex]';
    const highlightTableIndex =
      from === 'target[tableIndex]' || to === 'target[tableIndex]';
    const highlightTextIndex = from === 'text[textIndex]';
    props = {
      ...props,
      highlightTarget,
      highlightTargetIndex,
      highlightTableIndex,
      highlightTextIndex,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.STAGE, function () {
    props = {
      ...props,
      textIndex: -1,
      targetIndex: -1,
      tableIndex: -1,
    };
    resetHighlight(props);
  });

  events.on(EVENTS.RESULT, function () {
    resetHighlight(props);
  });
}

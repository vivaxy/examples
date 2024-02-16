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

/**
 * @typedef {import('../utils/types.js').EventEmitter} EventEmitter
 */

/**
 * @param {{
 *  tableIndex: number,
 *  patternTable: number[],
 * }} props
 */
function createApp(props) {
  // console.log('patternTableProps', props);
  return createElement('div', {}, [
    createElement('div', { class: 'pattern-table' }, [
      createElement('label', {}, [createText('Pattern table: ')]),
      ...props.patternTable.map(function (number, i) {
        return createElement(
          'span',
          {
            class: `char`,
          },
          [createText(number)],
        );
      }),
    ]),
    createElement('div', { class: 'table-index' }, [
      createElement('label', {}, [createText('Table index: ')]),
      ...Array.from(
        { length: Math.max(props.patternTable.length, props.tableIndex + 1) },
        function (_, i) {
          return createElement(
            'span',
            { class: `char ${i === props.tableIndex ? '' : 'hidden'}` },
            [createText('↑')],
          );
        },
      ),
    ]),
  ]);
}

/**
 * @param {EventEmitter} events
 */
export function initPatternTable(events) {
  let stage = 1;
  let props = {
    root: document.getElementById('pattern-table'),
    patternTable: [],
    tableIndex: -1,
  };

  events.on(EVENTS.STAGE, function ({ value }) {
    stage = value;
    props = {
      ...props,
      tableIndex: -1,
    };
    render(createApp, props, props.root);
  });

  events.on(EVENTS.SET_VALUE, function ({ key, value }) {
    if (key === 'tableIndex') {
      props = {
        ...props,
        tableIndex: value,
      };
      render(createApp, props, props.root);
    } else if (key === 'patternTable[tableIndex]') {
      const { patternTable } = props;
      patternTable[props.tableIndex] = value;
      props = {
        ...props,
        patternTable,
      };
      render(createApp, props, props.root);
    }
  });

  events.on(EVENTS.COMPARE, function ({ from }) {
    if (stage === 1) {
      if (from === 'target[tableIndex]') {
        props = {
          ...props,
        };
        render(createApp, props, props.root);
      }
    }
  });
}

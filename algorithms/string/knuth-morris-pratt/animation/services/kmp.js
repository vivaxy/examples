/**
 * @since 2024-02-04
 * @author vivaxy
 */
import * as EVENTS from '../enums/events.js';

/**
 * @typedef {import('../utils/types.js').EventEmitter} EventEmitter
 */

/**
 * @param {EventEmitter} events
 */
export function initKMP(events) {
  /**
   * @param {string} text
   * @param {string} target
   * @returns {Generator<*>}
   */
  return function* knuthMorrisPratt(text, target) {
    yield events.emit(EVENTS.INIT_INFO, { text, target });

    yield events.emit(EVENTS.STAGE, { value: 0 });
    yield events.emit(EVENTS.COMPARE, {
      from: 'target[length]',
      to: '0',
    });
    if (target.length === 0) {
      yield events.emit(EVENTS.RESULT, { value: 0 });
      return 0;
    }

    yield events.emit(EVENTS.STAGE, { value: 1 });
    const patternTable = yield* buildPatternTable(target);
    yield events.emit(EVENTS.STAGE, { value: 2 });

    let textIndex = 0;
    yield events.emit(EVENTS.SET_VALUE, { key: 'textIndex', value: 0 });
    let targetIndex = 0;
    yield events.emit(EVENTS.SET_VALUE, { key: 'targetIndex', value: 0 });

    while (textIndex < text.length) {
      yield events.emit(EVENTS.COMPARE, {
        from: 'text[textIndex]',
        to: 'target[targetIndex]',
      });
      if (text[textIndex] === target[targetIndex]) {
        if (targetIndex === target.length - 1) {
          yield events.emit(EVENTS.RESULT, { value: textIndex - targetIndex });
          return textIndex - targetIndex;
        }
        textIndex++;
        yield events.emit(EVENTS.SET_VALUE, {
          key: 'textIndex',
          value: textIndex,
        });
        targetIndex++;
        yield events.emit(EVENTS.SET_VALUE, {
          key: 'targetIndex',
          value: targetIndex,
        });
      } else {
        if (targetIndex === 0) {
          textIndex++;
          yield events.emit(EVENTS.SET_VALUE, {
            key: 'textIndex',
            value: textIndex,
          });
        } else {
          yield events.emit(EVENTS.SET_VALUE, {
            key: 'tableIndex',
            value: targetIndex - 1,
          });
          targetIndex = patternTable[targetIndex - 1];
          yield events.emit(EVENTS.SET_VALUE, {
            key: 'targetIndex',
            value: targetIndex,
          });
        }
      }
    }

    yield events.emit(EVENTS.RESULT, { value: -1 });
    return -1;
  };

  /**
   * @param {string} target
   * @returns {Generator<*>}
   */
  function* buildPatternTable(target) {
    let patternTable = [0];
    yield events.emit(EVENTS.SET_VALUE, { key: 'tableIndex', value: 0 });
    yield events.emit(EVENTS.SET_VALUE, {
      key: 'patternTable[tableIndex]',
      value: 0,
    });
    let tableIndex = 1;
    yield events.emit(EVENTS.SET_VALUE, { key: 'tableIndex', value: 1 });
    let targetIndex = 0;
    yield events.emit(EVENTS.SET_VALUE, {
      key: 'targetIndex',
      value: 0,
    });

    while (tableIndex < target.length) {
      yield events.emit(EVENTS.COMPARE, {
        from: 'target[tableIndex]',
        to: 'target[targetIndex]',
      });
      if (target[tableIndex] === target[targetIndex]) {
        patternTable[tableIndex] = targetIndex + 1;
        yield events.emit(EVENTS.SET_VALUE, {
          key: 'patternTable[tableIndex]',
          value: targetIndex + 1,
        });
        tableIndex++;
        yield events.emit(EVENTS.SET_VALUE, {
          key: 'tableIndex',
          value: tableIndex,
        });
        targetIndex++;
        yield events.emit(EVENTS.SET_VALUE, {
          key: 'targetIndex',
          value: targetIndex,
        });
      } else {
        if (targetIndex === 0) {
          patternTable[tableIndex] = 0;
          yield events.emit(EVENTS.SET_VALUE, {
            key: 'patternTable[tableIndex]',
            value: 0,
          });
          tableIndex++;
          yield events.emit(EVENTS.SET_VALUE, {
            key: 'tableIndex',
            value: tableIndex,
          });
        } else {
          targetIndex = patternTable[targetIndex - 1];
          yield events.emit(EVENTS.SET_VALUE, {
            key: 'targetIndex',
            value: targetIndex,
          });
        }
      }
    }

    return patternTable;
  }
}

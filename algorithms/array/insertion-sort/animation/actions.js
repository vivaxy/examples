/**
 * @since 2018-05-06 12:47:59
 * @author vivaxy
 */

import algorithm from './algorithm.js';
import array from './array.js';
import query from './query.js';
import events from './events.js';
import * as eventTypes from './event-types.js';
import * as stateTypes from './state-types.js';

const actions = algorithm(array.slice(), array.length);

let cursor = 0;

function applyNextAction() {
  setTimeout(() => {
    events.emit(eventTypes.APPLY_NEXT_ACTION, { action: actions[cursor++] });
  }, query.interval);
}

events.on(eventTypes.ON_AN_ACTION_END, () => {
  if (cursor < actions.length) {
    applyNextAction();
  } else {
    events.emit(eventTypes.ON_ACTION_DRAIN);
  }
});

events.on(eventTypes.ON_STATE_CREATE, (eventId, eventData) => {
  if (eventData.name === 'sort' && eventData.state === stateTypes.PLAYING) {
    applyNextAction();
  }
});

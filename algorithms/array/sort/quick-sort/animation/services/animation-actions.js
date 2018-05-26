/**
 * @since 2018-05-26 10:38:31
 * @author vivaxy
 */

import * as EVENT_TYPES from '../../../../../_animation/enums/event-types.js';
import * as ACTION_TYPES from '../enums/action-types.js';
import Element from '../class/element.js';

function init(events, query) {

  let elements = [];

  const actionHandlers = {
    [ACTION_TYPES.MARK_ARRAY]: (eventData) => {

    },

    [ACTION_TYPES.MARK_PIVOT]: (eventData) => {

    },

    [ACTION_TYPES.MARK_LOOP_INDEX]: (eventData) => {

    },

    [ACTION_TYPES.COMPARE]: (eventData) => {

    },

    [ACTION_TYPES.SWAP]: (eventData) => {

    },
  };

  events.on(EVENT_TYPES.REQUEST_ANIMATION_ACTIONS, (eventId, eventData) => {
    const body = document.body;
    elements = eventData.unsortedArray.map((value, index) => {
      return new Element({
        index,
        value,
        parent: body,
        width: 100 / eventData.unsortedArray.length,
        animationDuration: query.interval,
      });
    });
  });

  events.on(EVENT_TYPES.APPLY_AN_ANIMATION_ACTION, (eventId, eventData) => {

    // console.log('animation action:', eventData.animationAction);

    if (!elements) {
      throw new Error('elements not initialized');
    }

    if (!eventData.animationAction) {
      throw new Error('missing animationAction');
    }

    events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_START, eventData);

    const actionType = eventData.animationAction.type;
    const actionHandler = actionHandlers[actionType];
    if (!actionHandler) {
      throw new Error('Unexpected action type: ' + actionType);
    }
    actionHandler(eventData);

  });

}

export default { init };

/**
 * @since 2018-05-20 14:12:19
 * @author vivaxy
 */

import * as EVENT_TYPES from '../enums/event-types.js';

export default {
  init: (events) => {
    events.on(EVENT_TYPES.REQUEST_AN_UNSORTED_ARRAY, (eventId, eventData) => {
      const unsortedArray = Array.from({ length: eventData.arrayLength }, (item, index) => {
        return Math.random();
      });

      events.emit(EVENT_TYPES.REQUEST_ANIMATION_ACTIONS, { unsortedArray });
    });
  },
};

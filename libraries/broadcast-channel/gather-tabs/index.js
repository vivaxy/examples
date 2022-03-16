/**
 * @since 2022-03-15
 * @author vivaxy
 */
import { BroadcastChannel } from 'https://cdn.skypack.dev/broadcast-channel';

const channel = new BroadcastChannel('sample');

const TAB_ID = Math.random().toString(36).slice(2);

const MESSAGE_TYPES = {
  GATHER_TABS_REQUEST: 'gather-tabs-request',
  GATHER_TABS_RESPONSE: 'gather-tabs-response',
};

let gathering = null;

channel.onmessage = ({ type, tabId }) => {
  switch (type) {
    case MESSAGE_TYPES.GATHER_TABS_REQUEST:
      channel.postMessage({
        type: MESSAGE_TYPES.GATHER_TABS_RESPONSE,
        tabId: TAB_ID,
      });
      break;
    case MESSAGE_TYPES.GATHER_TABS_RESPONSE:
      if (gathering) {
        gathering.push(tabId);
        console.log('RTT: ' + (Date.now() - startTime) + 'ms');
      }
      break;
    default:
      throw new Error('Unexpected message type: ' + type);
  }
};

const startTime = Date.now();
channel.postMessage({ type: MESSAGE_TYPES.GATHER_TABS_REQUEST });
gathering = [];
setTimeout(() => {
  console.log(gathering);
  gathering = null;
}, 1000);

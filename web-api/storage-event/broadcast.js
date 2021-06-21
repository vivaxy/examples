/**
 * @since 2021-06-21
 * @author vivaxy
 */
import EventEmitter from 'https://unpkg.com/@vivaxy/framework/class/event-emitter2.js';

const STORAGE_EVENT = 'storage';
const MESSAGE_EVENT = 'message';

function getStorageKey(channelId) {
  return `broadcast__${channelId}`;
}

export default class Broadcast extends EventEmitter {
  constructor(channelId) {
    super();
    this.channelId = channelId;
    this.storageKey = getStorageKey(channelId);
    this.uid = 0;
    window.addEventListener(STORAGE_EVENT, this.#handleEvent);
  }

  #handleEvent = (e) => {
    if (e.key === this.storageKey) {
      const message = this.#parseStorage(e.newValue);
      if (message) {
        this.emit(MESSAGE_EVENT, message);
      }
    }
  };

  destroy() {
    this.off(MESSAGE_EVENT);
    window.removeEventListener(STORAGE_EVENT, this.#handleEvent);
    localStorage.removeItem(this.storageKey);
  }

  send(message) {
    this.#setStorage(message);
    this.emit(MESSAGE_EVENT, message);
  }

  #setStorage(message) {
    const item = JSON.stringify({ uid: this.uid++, value: message });
    localStorage.setItem(this.storageKey, item);
  }

  #parseStorage(item) {
    try {
      const { value } = JSON.parse(item);
      return value;
    } catch (e) {}
    return null;
  }
}

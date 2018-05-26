/**
 * @since 2018-05-20 14:05:19
 * @author vivaxy
 */

export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   *
   * @param event
   * @param callback
   * @param refer
   * @returns {EventEmitter}
   */
  on(event, callback, refer) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push({ callback, refer });
    return this;
  }

  /**
   * Do not using polymorphism
   * @param event
   * @param data
   * @param sender
   * @returns {EventEmitter}
   */
  emit(event, data, sender) {
    // console.group('emit');
    // console.log('%cevent', 'background-color: #aaaaff;', event);
    // console.log('%cdata', 'background-color: #aaaaff;', data);
    // console.log('%csender', 'background-color: #aaaaff;', sender);
    const handlers = this.events[event];
    if (handlers) {
      for (let i = 0; i < handlers.length;) {
        const handler = handlers[i];
        if (handler) {
          handler.callback(event, data, sender, handler.refer);
          // console.log('%ccallback', 'background-color: #aaaaff;', handler.callback);
          if (handler === handlers[i]) {
            i++;
          }
        }
      }
    }
    // console.groupEnd();
    return this;
  }

  /**
   *
   * @param event
   * @param callback
   * @param refer
   * @returns {EventEmitter}
   */
  off(event, callback, refer) {
    const handlers = this.events[event];
    if (handlers) {
      const handlersLength = handlers.length;
      for (let i = 0; i < handlersLength; i++) {
        const handler = handlers[i];
        if (handler.callback === callback && handler.refer === refer) {
          handlers.splice(i, 1);
          if (handlers.length === 0) {
            delete this.events[event];
          }
          return this;
        }
      }
    } else {
      this.events[event] = [];
    }
    return this;
  }

}

/**
 * @since 20180418 15:25
 * @author vivaxy
 */

class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   *
   * @param event
   * @param callback
   * @param refer
   */
  on(event, callback, refer) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push({ callback, refer });
    return () => {
      this.off(event, callback, refer);
    };
  }

  /**
   * Do not using polymorphism
   * @param event
   * @param data
   * @param sender
   * @returns {EventEmitter}
   */
  emit(event, data, sender) {
    const handlers = this.events[event];
    for (let i = 0; i < handlers.length;) {
      const handler = handlers[i];
      if (handler) {
        handler.callback(event, data, sender, handler.refer);
        if (handler === handlers[i]) {
          i++;
        }
      }
    }
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

export default EventEmitter;

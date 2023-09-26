/**
 * @since 2023-08-14
 * @author vivaxy
 */
import { EventEmitter } from 'events';

interface IEventsProtocol {
  [eventName: string | symbol]: unknown[];
}

interface IEventListenerProtocol<T extends unknown[]> {
  (...args: T): void;
}

export class TypedEventEmitter<
  Events extends IEventsProtocol
> extends EventEmitter {
  on<EventName extends keyof Events>(
    eventName: EventName,
    eventListener: IEventListenerProtocol<Events[EventName]>,
  ) {
    return super.on(eventName as string | symbol, eventListener);
  }

  emit<EventName extends keyof Events>(
    eventName: EventName,
    ...args: Events[EventName]
  ) {
    return super.emit(eventName as string | symbol, ...args);
  }

  off<EventName extends keyof Events>(
    eventName: EventName,
    eventListener: IEventListenerProtocol<Events[EventName]>,
  ) {
    return super.off(eventName as string | symbol, eventListener);
  }
}

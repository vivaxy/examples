/**
 * @since 2023-08-14
 * @author vivaxy
 */
interface IEventsProtocol {
  [eventName: string]: unknown[];
}

interface IEventListenerProtocol<T extends unknown[]> {
  (...args: T): void;
}

export interface IEventEmitter<Events extends IEventsProtocol> {
  eventListenerMap: Map<keyof Events, Set<IEventListenerProtocol<unknown[]>>>;

  on<EventName extends keyof Events>(
    eventName: EventName,
    eventListener: IEventListenerProtocol<Events[EventName]>,
  ): () => void;

  emit<EventName extends keyof Events>(
    eventName: EventName,
    ...args: Events[EventName]
  ): void;

  off<EventName extends keyof Events>(
    eventName: EventName,
    eventListener: IEventListenerProtocol<Events[EventName]>,
  ): void;
}

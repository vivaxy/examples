import { TEventProtocol } from './event-protocol';
import { TypedEventEmitter } from '../lib/typed-event-emitter';

export const eventEmitter = new TypedEventEmitter<TEventProtocol>();

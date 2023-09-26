/**
 * @since 2023-08-14
 * @author vivaxy
 */
import { TEventProtocol } from './event-protocol';
import { TypedEventEmitter } from '../lib/typed-event-emitter';

export const eventEmitter = new TypedEventEmitter<TEventProtocol>();

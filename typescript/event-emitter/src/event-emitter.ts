/**
 * @since 2023-08-14
 * @author vivaxy
 */
import { EventEmitter } from 'events';
import { IEventEmitter } from '../lib/event-emitter';
import { TEventProtocol } from './event-protocol';

export const eventEmitter = (new EventEmitter() as unknown) as IEventEmitter<
  TEventProtocol
>;

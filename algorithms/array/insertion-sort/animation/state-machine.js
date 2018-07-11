/**
 * @since 2018-05-06 11:16:50
 * @author vivaxy
 */

import * as eventTypes from './event-types.js';

export default class StateMachine {
  constructor(name, events, maxStatePipeline = 10) {

    this.name = name;
    this.events = events;
    this.maxStatePipeline = maxStatePipeline;

    this.statePipeline = new Array(maxStatePipeline);
    this.stateCursor = 0;

    this.previousState = null;
    this.currentState = null;
  }

  switchState(state, useCreate = true, useDispose = true) {
    this.setNextState(state);
    this.switchToNextState(state, useCreate, useDispose);
  }

  switchToNextState(useCreate = true, useDispose = true) {
    this.previousState = this.statePipeline[this.stateCursor];
    this.stateCursor = this.getNextCursor();

    if (useDispose) {
      this.stateDispose();
    }
    this.currentState = this.statePipeline[this.stateCursor];
    if (useCreate) {
      this.stateCreate();
    }
  }

  switchToPrevState(useCreate = true, useDispose = true) {
    this.previousState = this.statePipeline[this.stateCursor];
    this.stateCursor = this.getPrevCursor();

    if (useDispose) {
      this.stateDispose();
    }
    this.currentState = this.statePipeline[this.stateCursor];
    if (useCreate) {
      this.stateCreate();
    }
  }

  getNextCursor() {
    const nextStateCursor = this.stateCursor + 1;
    if (nextStateCursor > this.maxStatePipeline - 1) {
      return 0;
    }
    return nextStateCursor;
  }

  getPrevCursor() {
    const prevStateCursor = this.stateCursor - 1;
    if (prevStateCursor < 0) {
      return this.maxStatePipeline - 1;
    }
    return prevStateCursor;
  }

  setNextState(state) {
    this.statePipeline[this.getNextCursor()] = state;
  }

  stateCreate() {
    this.events.emit(eventTypes.ON_STATE_CREATE, {
      stateMachine: this,
      name: this.name,
      preState: this.previousState,
      state: this.currentState,
    });
  }

  stateDispose() {
    this.events.emit(eventTypes.ON_STATE_DISPOSE, {
      stateMachine: this,
      name: this.name,
      state: this.currentState,
      nextState: this.statePipeline[this.stateCursor],
    });
  }

  peek() {
    return this.currentState;
  }

  dispose() {
    this.name = null;
    this.events = null;
    this.maxStatePipeline = null;

    this.statePipeline = null;
    this.stateCursor = null;

    this.previousState = null;
    this.currentState = null;
  }

}

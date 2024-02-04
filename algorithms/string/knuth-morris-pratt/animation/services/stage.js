/**
 * @since 2024-02-04
 * @author vivaxy
 */
import {
  createElement,
  createText,
  render,
} from 'https://unpkg.com/@vivaxy/framework/ui/render-app.js';
import * as EVENTS from '../enums/events.js';

const props = {
  root: document.getElementById('stage'),
};

function createApp() {
  return createElement('h1', {}, [
    createText('Stage 1: Initialize Pattern Table'),
  ]);
}

export function initStage(events) {
  events.on(EVENTS.STAGE, function ({ value }) {
    props.stage = value;
    render(createApp, props, props.root);
  });
}

/**
 * @since 2021-06-24
 * @author vivaxy
 */
import EventEmitter from '//esm.run/@vivaxy/framework/class/event-emitter2.js';
import openANewDoc from './services/open-a-new-doc.js';
import doc from './services/doc.js';
import docRenderer from './services/doc-renderer.js';
import syncDocButtons from './services/sync-doc-buttons.js';
import steps from './steps/doc-edit.js';
// import steps from './steps/two-doc-sync-without-conflicts.js';

const e = new EventEmitter();

openANewDoc.init(e);
doc.init(e);
docRenderer.init(e);
syncDocButtons.init(e);

let curStep = 0;

function nextStep() {
  if (curStep >= steps.length) {
    return false;
  }
  const step = steps[curStep];
  e.emit(...step);
  curStep++;
  return true;
}

window.nextStep = nextStep;

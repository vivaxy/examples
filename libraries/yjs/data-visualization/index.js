/**
 * @since 2021-06-24
 * @author vivaxy
 */
import EventEmitter from '//esm.run/@vivaxy/framework/class/event-emitter2.js';
import openANewDoc from './services/open-a-new-doc.js';
import doc from './services/doc.js';
import docRenderer from './services/doc-renderer.js';
import syncDocButtons from './services/sync-doc-buttons.js';
import scenarios from './services/scenarios.js';

const e = new EventEmitter();

openANewDoc.init(e);
doc.init(e);
docRenderer.init(e);
syncDocButtons.init(e);
scenarios.init(e);

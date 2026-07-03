import { html, render } from '//unpkg.com/htm/preact/standalone.module.js';
import App from './components/app.js';

render(html` <${App} /> `, document.body);

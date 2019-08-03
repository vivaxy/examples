/**
 * @since 2019-08-02 17:41
 * @author vivaxy
 */
import { html, render } from '//unpkg.com/htm/preact/standalone.module.js';
import App from './components/app.js';

render(
  html`
    <${App} />
  `,
  document.body,
);

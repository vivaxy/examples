/**
 * @since 2023-06-27
 * @author vivaxy
 */
import { html, render } from 'https://esm.sh/htm/preact';
import { useState } from 'https://esm.sh/preact/hooks';

function App() {
  const [count, setCount] = useState(0);

  function add() {
    setCount(count + 1);
  }

  return html`<div onClick=${add}>Count: <span>${count}</span>!</div>`;
}

render(html` <${App} />`, document.body);

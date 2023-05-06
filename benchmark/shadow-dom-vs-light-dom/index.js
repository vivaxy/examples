/**
 * @since 2023-05-06
 * @author vivaxy
 */
import { run } from 'https://unpkg.com/@vivaxy/framework/utils/benchmark';

const innerHTML = `
<h1>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</h1>
<h2>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</h2>
<h3>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</h3>
<h4>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</h4>
<h5>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</h5>
<h6>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</h6>
<div>
<p>Id pariatur tempor culpa enim lorem officia aliqua culpa exercitation laborum sit adipiscing ea exer</p>
</div>
`;

const LOOP = 1e4;

const lightDOM = document.getElementById('light-dom');
const openShadowDOM = document
  .getElementById('open-shadow-dom')
  .attachShadow({ mode: 'open' });
const closedShadowDOM = document
  .getElementById('closed-shadow-dom')
  .attachShadow({ mode: 'closed' });

const costLightDOM = await run(
  function () {
    lightDOM.innerHTML = innerHTML;
  },
  {
    beforeEach: () => (lightDOM.innerHTML = ''),
    loop: LOOP,
  },
);

const costOpenShadowDOM = await run(
  function () {
    openShadowDOM.innerHTML = innerHTML;
  },
  {
    beforeEach: () => (openShadowDOM.innerHTML = ''),
    loop: LOOP,
  },
);

const costClosedShadowDOM = await run(
  function () {
    closedShadowDOM.innerHTML = innerHTML;
  },
  {
    beforeEach: () => (closedShadowDOM.innerHTML = ''),
    loop: LOOP,
  },
);

console.log(`
Light DOM ${costLightDOM}ms;
Open ShadowDOM ${costOpenShadowDOM}ms;
Closed ShadowDOM ${costClosedShadowDOM}ms;
`);

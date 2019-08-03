import { run } from '@cycle/run';
import { div, label, input, hr, h1, makeDOMDriver } from '@cycle/dom';

function main(sources) {
  const input$ = sources.DOM.select('.field').events('input');

  const name$ = input$.map((ev) => ev.target.value).startWith('');

  const vdom$ = name$.map((name) =>
    div([
      label('Name:'),
      input('.field', { attrs: { type: 'text' } }),
      hr(),
      h1('Hello ' + name),
    ]),
  );

  return { DOM: vdom$ };
}

run(main, { DOM: makeDOMDriver('#app-container') });

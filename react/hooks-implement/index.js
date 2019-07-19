/**
 * @since 2019-07-19 18:53
 * @author vivaxy
 */

const map = {};

let currentComponent = null;

function render(component) {
  currentComponent = component;
  component();
}

function useHook(fn) {
  map[currentComponent.name] = fn;
}

function ComponentA() {
  useHook(function() {
    console.log('ComponentA');
  });
  render(ComponentAA);
}

function ComponentAA() {
  useHook(function() {
    console.log('ComponentAA');
  });
}

function ComponentB() {
  useHook(function() {
    console.log('ComponentB');
  });
}

render(ComponentA);
render(ComponentB);

window.map = map;

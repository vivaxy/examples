/**
 * @since 2020-09-30 17:01
 * @author vivaxy
 */
function simpleErrorBoundary(fn) {
  try {
    fn();
  } catch (e) {
    console.error('error', e);
  }
}

function betterErrorBoundary(fn) {
  const $fake = document.createElement('fake');
  const FAKE_EVENT = 'FAKE_EVENT';
  $fake.addEventListener(FAKE_EVENT, fn);
  function handleError(e) {
    console.error('error', e.error);
    e.preventDefault();
  }
  window.addEventListener('error', handleError);
  $fake.dispatchEvent(new CustomEvent(FAKE_EVENT));
  window.removeEventListener('error', function(e) {
    console.error('error', e);
  });
}

function test1() {
  console.log(1);
  simpleErrorBoundary(function() {
    console.log(2);
    // do not pause when `Pause on exceptions` on
    // only pause when `Pause on caught exceptions` on
    throw new Error();
    console.log(3);
  });
  console.log(4);
}

test1();

function test2() {
  console.log(1);
  betterErrorBoundary(function() {
    console.log(2);
    // pause when `Pause on exceptions` on
    throw new Error();
    console.log(3);
  });
  console.log(4);
}

test2();

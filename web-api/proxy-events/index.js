/**
 * @since 2024-02-22
 * @author vivaxy
 */
/**
 *
 * @param {EventTarget} target
 * @param {(e: Event) => void} listener
 */
function addEventListenerToAllEvents(target, listener) {
  for (const key in target) {
    if (key.startsWith('on')) {
      const eventType = key.slice(2);
      target.addEventListener(eventType, listener, { capture: true });
    }
  }
}

addEventListenerToAllEvents(window, function (e) {
  // @ts-expect-error myProp is not on Event
  e.myProp = 'myValue';
});

document.addEventListener('click', function (e) {
  // @ts-expect-error myProp is not on Event
  console.log('e.myProp', e.myProp);
});

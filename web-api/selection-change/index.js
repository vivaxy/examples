/**
 * @since 2022-06-10 13:36
 * @author vivaxy
 */
// const $app = document.getElementById('app');

let lastTimestamp = performance.now();

function getTimeDuration() {
  const now = performance.now();
  const diff = Math.round(now - lastTimestamp);
  lastTimestamp = now;
  return diff;
}

['selectionchange', 'pointerup'].forEach(function (eventName) {
  document.addEventListener(eventName, function (e) {
    console.log(
      e.type,
      getTimeDuration(),
      'selection="' + window.getSelection().toString() + '"',
    );
  });
});

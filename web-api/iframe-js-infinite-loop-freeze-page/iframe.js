/**
 * @since 2023-08-29
 * @author vivaxy
 */
function startInfiniteLoop() {
  while (true) {
    console.log('loop');
  }
}

document
  .getElementById('start-infinite-loop')
  .addEventListener('click', startInfiniteLoop);

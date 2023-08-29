/**
 * @since 2023-08-29
 * @author vivaxy
 */
function startInfiniteLoop() {
  while (true) {
    console.log('infinite loop');
  }
}

self.addEventListener('message', function (e) {
  if (e.data === 'start-infinite-loop') {
    startInfiniteLoop();
  }
});

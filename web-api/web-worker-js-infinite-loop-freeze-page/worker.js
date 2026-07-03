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

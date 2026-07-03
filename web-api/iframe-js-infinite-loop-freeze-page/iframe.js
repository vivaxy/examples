function startInfiniteLoop() {
  while (true) {
    console.log('loop');
  }
}

document
  .getElementById('start-infinite-loop')
  .addEventListener('click', startInfiniteLoop);

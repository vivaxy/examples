function longTask() {
  let a = 0;
  for (let i = 0; i < 1e9; i++) {
    a += i;
  }
}
window.addEventListener('message', function (e) {
  if (e.data === 'run-long-task') {
    longTask();
  }
});

setInterval(() => {
  longTask();
}, 3e3);

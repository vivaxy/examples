var stdout = process.stdout,
  isTTY = stdout.isTTY,
  progress = 0;

if (isTTY) {
  setInterval(function () {
    progress++;
    stdout.cursorTo(0);
    stdout.write(progress.toString());
    stdout.clearLine(1);
  }, 100);
}

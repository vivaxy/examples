/**
 * @since 15-08-03 14:07
 * @author vivaxy
 */
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

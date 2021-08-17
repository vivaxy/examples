/**
 * @since 2021-08-17
 * @author vivaxy
 */
const id = Number(process.argv[2]);

process.on('message', function (data) {
  console.log(`[child ${id}] got message ${data}`);
  if (data === 'exit') {
    process.exit(0);
  } else if (data === 'error') {
    process.exit(1);
  } else {
    process.send(`received ${data}`);
  }
});

process.send(`connected`);

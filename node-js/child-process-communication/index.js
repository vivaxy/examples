/**
 * @since 2021-08-17
 * @author vivaxy
 */
const child_process = require('child_process');

const childrenCount = 5;
const children = {};
for (let i = 0; i < childrenCount; i++) {
  const child = child_process.fork('./child.js', [String(i)]);
  children[i] = child;
  child.on('message', function (data) {
    console.log(`[parent] got message from [child ${i}] ${data}`);
  });
  child.on('error', function (e) {
    console.log(`[parent] [child ${i}] error`, e);
  });
  child.on('exit', function () {
    console.log(`[parent] [child ${i}] exited`);
    delete children[i];
    if (Object.keys(children).length === 0) {
      process.exit(0);
    }
  });
}

const stdIn = process.stdin;
stdIn.setEncoding('utf8');
stdIn.on('data', function (data) {
  if (data === 'exit\n') {
    Object.values(children).forEach(function (child) {
      child.send('exit');
    });
  } else {
    const [id, value] = data.split(' ');
    children[id].send(value);
  }
});

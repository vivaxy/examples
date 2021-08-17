/**
 * @since 2021-08-17
 * @author vivaxy
 */
const child_process = require('child_process');

function log(...data) {
  console.log('[parent]', ...data);
}

const childrenCount = 5;
const children = {};
for (let i = 0; i < childrenCount; i++) {
  const child = child_process.fork('./child.js', [String(i)]);
  children[i] = child;
  child.on('message', function (data) {
    log(`got message from [child ${i}] ${data}`);
  });
  child.on('error', function (e) {
    log(`[child ${i}] error`, e);
  });
  child.on('exit', function (code, signal) {
    log(`[child ${i}] exited with code: ${code}, signal: ${signal}`);
    delete children[i];
    if (Object.keys(children).length === 0) {
      process.exit(0);
    }
  });
}

const stdIn = process.stdin;
stdIn.setEncoding('utf8');
stdIn.on('data', function (data) {
  const [id, value] = data.slice(0, data.length - 1).split(' ');
  if (!children[id]) {
    log(`[child ${id}] not exists`);
  } else {
    children[id].send(value);
  }
});

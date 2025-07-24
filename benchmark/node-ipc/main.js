/**
 * @since 2025-07-24 16:36
 * @author vivaxy
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fork } = require('child_process');

const child = fork('./worker.js');

function test(payloadSize) {
  return new Promise((resolve) => {
    const payload = Buffer.alloc(payloadSize, 'a');
    const start = performance.now();
    let sendTime = 0;

    child.send({ data: payload }, () => {
      sendTime = performance.now() - start;
    });

    // 接收子进程回传的响应
    child.on('message', (msg) => {
      resolve({ sendTime, roundtripTime: performance.now() - start });
    });
  });
}

async function main() {
  const testCases = [
    1, // 1B
    2, // 2B
    4,
    8,
    16,
    32,
    64,
    128,
    256,
    512,
    1024, // 1KB
    2 * 1024, // 10KB
    4 * 1024,
    8 * 1024,
    16 * 1024,
    32 * 1024,
    64 * 1024,
    128 * 1024,
    256 * 1024,
    512 * 1024,
    1024 * 1024, // 1MB
    2 * 1024 * 1024, // 2MB
    4 * 1024 * 1024,
    8 * 1024 * 1024,
    16 * 1024 * 1024,
  ];
  let x = [];
  let y = [];
  for (const testCase of testCases) {
    const { sendTime, roundtripTime } = await test(testCase);
    console.log(`${testCase}\t${sendTime}\t${roundtripTime}`);
    x.push(testCase);
    y.push(roundtripTime);
  }
  child.disconnect();
  console.log('x', x.join(','));
  console.log('y', y.join(','));
}

main();

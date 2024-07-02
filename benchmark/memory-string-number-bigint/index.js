/**
 * @since 2024-07-02
 * @author vivaxy
 */
async function getMemory() {
  // @ts-expect-error measureUserAgentSpecificMemory
  if (performance.measureUserAgentSpecificMemory) {
    // @ts-expect-error measureUserAgentSpecificMemory
    const memorySample = await performance.measureUserAgentSpecificMemory();
    return memorySample.bytes;
  }
  // @ts-expect-error memory
  if (performance.memory) {
    // @ts-expect-error memory
    return performance.memory.usedJSHeapSize;
  }
  return 0;
}

/**
 *
 * @param {Uint8Array} bytes
 * @return {string}
 */
function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join('');
  return btoa(binString);
}

/**
 * @param {number} number
 * @return {Uint8Array}
 */
function numberToBytes(number) {
  const dataView = new DataView(new ArrayBuffer(8), 0);
  dataView.setBigUint64(0, BigInt(number));
  return new Uint8Array(dataView.buffer);
}

/**
 * @param {number} number
 * @return {string}
 */
function generateString(number) {
  return bytesToBase64(numberToBytes(number));
}

/**
 * @param {number} number
 * @return {number}
 */
function generateNumber(number) {
  return number;
}

/**
 * @param {number} number
 * @return {bigint}
 */
function generateBigInt(number) {
  return BigInt(number);
}

/**
 * @param {number} value
 * @return {string}
 */
function formatBytes(value) {
  let result = value;
  let i = 0;
  const units = ['KB', 'MB'];
  for (; i < units.length; i++) {
    if (result > 1024) {
      result /= 1024;
    }
  }
  return `${result}${units[i - 1]}`;
}

let values = [];

document.getElementById('clear').addEventListener('click', async function () {
  const before = await getMemory();
  values = [];
  const after = await getMemory();
  console.log(`clear: ${after} - ${before} = ${formatBytes(after - before)}`);
});

[generateString, generateNumber, generateBigInt].forEach(function (fn) {
  document.getElementById(fn.name).addEventListener('click', async function () {
    const before = await getMemory();
    for (let i = 0; i < 1e6; i++) {
      values.push(fn(2 ** 52));
    }
    const after = await getMemory();
    console.log(
      `${fn.name}: ${after} - ${before} = ${formatBytes(after - before)}`,
    );
  });
});

/**
 * @since 2024-07-08
 * @author vivaxy
 */
import pako from 'https://esm.run/pako';

/**
 * @param {string} base64
 * @return {ArrayBufferLike}
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * @param {string} string
 * @return {string}
 */
function decode(string) {
  const buffer = base64ToArrayBuffer(string);
  return pako.inflate(buffer, {
    to: 'string',
  });
}

/**
 * @param {string} string
 * @return {string}
 */
function encode(string) {
  const compressed = pako.gzip(string, {
    level: 9,
  });
  let binaryString = '';
  for (let i = 0; i < compressed.length; i++) {
    binaryString += String.fromCharCode(compressed[i]);
  }
  return btoa(binaryString);
}

document.getElementById('decode').addEventListener('click', () => {
  try {
    const inputValue = /** @type {HTMLTextAreaElement} */ (
      document.getElementById('input')
    ).value;
    /** @type {HTMLTextAreaElement} */ (
      document.getElementById('output')
    ).value = JSON.stringify(JSON.parse(decode(inputValue)), null, 2);
  } catch (error) {
    console.error(error);
  }
});

document.getElementById('encode').addEventListener('click', function () {
  try {
    const inputValue = /** @type {HTMLTextAreaElement} */ (
      document.getElementById('output')
    ).value;
    /** @type {HTMLTextAreaElement} */ (
      document.getElementById('input')
    ).value = encode(JSON.stringify(JSON.parse(inputValue)));
  } catch (error) {
    console.error(error);
  }
});

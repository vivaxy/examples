/**
 * @since 2024-07-08
 * @author vivaxy
 */
import pako from 'https://unpkg.com/pako?module';

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
  return bytes.buffer;
}

/**
 * @param {string} string
 * @return {string}
 */
function decode(string) {
  return pako.inflate(base64ToArrayBuffer(string), {
    to: 'string',
  });
}

/**
 * @param {string} string
 * @return {string}
 */
function encode(string) {
  // todo
  const compressed = pako.deflate(string);
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

// document.getElementById('encode').addEventListener('click', function () {
//   try {
//     const inputValue = /** @type {HTMLTextAreaElement} */ (
//       document.getElementById('output')
//     ).value;
//     /** @type {HTMLTextAreaElement} */ (
//       document.getElementById('input')
//     ).value = encode(JSON.stringify(JSON.parse(inputValue)));
//   } catch (error) {
//     console.error(error);
//   }
// });

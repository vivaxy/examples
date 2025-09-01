/**
 * @since 2024-07-08
 * @author vivaxy
 */
import pako from 'https://esm.run/pako@2.1.0';
import React from 'https://esm.run/react@18.2.0';
import { createRoot } from 'https://esm.run/react-dom@18.2.0/client';
import JsonView from 'https://esm.run/@uiw/react-json-view@1.12.2';

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

// /**
//  * @param {string} string
//  * @return {string}
//  */
// function encode(string) {
//   const compressed = pako.gzip(string, {
//     level: 9,
//   });
//   let binaryString = '';
//   for (let i = 0; i < compressed.length; i++) {
//     binaryString += String.fromCharCode(compressed[i]);
//   }
//   return btoa(binaryString);
// }

function handleDecode() {
  try {
    const inputValue = /** @type {HTMLTextAreaElement} */ (
      document.getElementById('input')
    ).value;
    if (!inputValue) {
      return;
    }
    const outputDOM = /** @type {HTMLTextAreaElement} */ (
      document.getElementById('output')
    );
    const root = createRoot(outputDOM);
    root.render(
      React.createElement(JsonView, { value: JSON.parse(decode(inputValue)) }),
    );
  } catch (error) {
    console.error(error);
  }
}

document.getElementById('decode').addEventListener('click', handleDecode);
document.getElementById('input').addEventListener('input', handleDecode);

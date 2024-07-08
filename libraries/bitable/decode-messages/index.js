/**
 * @since 2024-07-08
 * @author vivaxy
 */
import pako from 'https://unpkg.com/pako?module';

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

document.getElementById('decode').addEventListener('click', () => {
  try {
    const inputValue = /** @type {HTMLTextAreaElement} */ (
      document.getElementById('input')
    ).value;
    const outputValue = JSON.stringify(
      JSON.parse(
        pako.inflate(base64ToArrayBuffer(inputValue), {
          to: 'string',
        }),
      ),
      null,
      2,
    );
    /** @type {HTMLTextAreaElement} */ (
      document.getElementById('output')
    ).value = outputValue;
  } catch (error) {
    console.error(error);
  }
});

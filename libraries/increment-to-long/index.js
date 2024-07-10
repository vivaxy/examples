/**
 * @since 2024-07-10
 * @author vivaxy
 */
import { incrementToLong } from './utils/increment-to-long.js';

const input = /** @type {HTMLInputElement} */ (
  document.getElementById('input')
);

button.onclick = function () {
  const newValue = incrementToLong(Number(input.value));
  console.log(newValue);
  input.value = String(newValue);
};

/**
 * @since 2024-07-08
 * @author vivaxy
 */
// @ts-expect-error Go is defined globally
const go = new Go();
WebAssembly.instantiateStreaming(fetch('./main.wasm'), go.importObject).then(
  (result) => {
    go.run(result.instance);
  },
);

document.getElementById('button').addEventListener('click', function () {
  const inputValue = /** @type {HTMLTextAreaElement} */ (
    document.getElementById('input')
  ).value;
  // @ts-expect-error tokenizeSentence is defined globally
  const outputValue = window.tokenizeSentence(inputValue);
  /** @type {HTMLTextAreaElement} */ (document.getElementById('output')).value =
    outputValue;
});

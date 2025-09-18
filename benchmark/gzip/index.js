/**
 * @since 2025-09-18 12:52
 * @author vivaxy
 */
import pako from 'https://esm.run/pako@2.1.0';

function stringify(string) {
  return string;
}

function gzip(string) {
  const compressed = pako.gzip(string);
  let binaryString = '';
  for (let i = 0; i < compressed.length; i++) {
    binaryString += String.fromCharCode(compressed[i]);
  }
  return binaryString;
}

function gzipBase64(string) {
  const compressed = pako.gzip(string);
  let binaryString = '';
  for (let i = 0; i < compressed.length; i++) {
    binaryString += String.fromCharCode(compressed[i]);
  }
  return btoa(binaryString);
}

function run(fn) {
  const value = document.getElementById('input').value;
  console.log('--------', fn.name, '--------');
  const startTime = performance.now();
  const result = fn(value);
  console.log('cost', performance.now() - startTime);
  console.log('size', new Blob([result]).size);
}

document.getElementById('run').addEventListener('click', () => {
  run(stringify);
  run(gzip);
  run(gzipBase64);
});

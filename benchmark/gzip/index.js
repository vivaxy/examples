/**
 * @since 2025-09-18 12:52
 * @author vivaxy
 */
import pako from 'https://esm.run/pako@2.1.0';

const methods = [
  {
    name: 'toString',
    encode: toString,
    decode: toString,
  },
  {
    name: 'gzip',
    encode: gzipEncode,
    decode: gzipDecode,
  },
  {
    name: 'gzipBase64',
    encode: gzipBase64Encode,
    decode: gzipBase64Decode,
  },
  {
    name: 'zlibBase64',
    encode: zlibBase64Encode,
    decode: zlibBase64Decode,
  },
];

function toString(string) {
  return string;
}

function gzipEncode(string) {
  const compressed = pako.gzip(string);
  let binaryString = '';
  for (let i = 0; i < compressed.length; i++) {
    binaryString += String.fromCharCode(compressed[i]);
  }
  return binaryString;
}

function gzipDecode(binaryString) {
  const arr = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    arr[i] = binaryString.charCodeAt(i);
  }
  return pako.inflate(arr, { to: 'string' });
}

function gzipBase64Encode(string) {
  const compressed = pako.gzip(string);
  let binaryString = '';
  for (let i = 0; i < compressed.length; i++) {
    binaryString += String.fromCharCode(compressed[i]);
  }
  return btoa(binaryString);
}

function gzipBase64Decode(base64) {
  const binaryString = atob(base64);
  const arr = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    arr[i] = binaryString.charCodeAt(i);
  }
  return pako.inflate(arr, { to: 'string' });
}

function zlibBase64Encode(string) {
  const compressed = pako.deflate(string);
  let binaryString = '';
  for (let i = 0; i < compressed.length; i++) {
    binaryString += String.fromCharCode(compressed[i]);
  }
  return btoa(binaryString);
}

function zlibBase64Decode(base64) {
  const binaryString = atob(base64);
  const arr = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    arr[i] = binaryString.charCodeAt(i);
  }
  return pako.inflate(arr, { to: 'string' });
}

function run({ name, encode, decode }) {
  const value = document.getElementById('input').value;
  console.log('--------', name, '--------');
  let startTime = performance.now();
  const encoded = encode(value);
  console.log('encode size:', new Blob([encoded]).size, 'bytes');
  console.log('encode cost:', performance.now() - startTime, 'ms');

  startTime = performance.now();
  const decoded = decode(encoded);
  console.log('decode cost:', performance.now() - startTime, 'ms');
  if (value !== decoded) {
    throw new Error('value !== decoded');
  }
}

document.getElementById('run').addEventListener('click', () => {
  methods.forEach((method) => {
    run(method);
  });
});

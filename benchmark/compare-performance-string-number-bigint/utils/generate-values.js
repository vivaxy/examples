/**
 * @since 2024-07-09
 * @author vivaxy
 */

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
function bytesToHexString(bytes) {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += (bytes[i] >> 4).toString(16) + (bytes[i] & 0xf).toString(16);
  }
  return result;
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
export function numberToUint8Array(number) {
  const dataView = new DataView(new ArrayBuffer(8), 0);
  dataView.setBigUint64(0, BigInt(number));
  return new Uint8Array(dataView.buffer);
}

/**
 * @param {number} number
 * @return {Uint16Array}
 */
export function numberToUint16Array(number) {
  const uint8Array = numberToUint8Array(number);
  const uint16Array = new Uint16Array(uint8Array.length / 2);
  for (let i = 0; i < uint8Array.length; i += 2) {
    uint16Array[i / 2] = uint8Array[i] * 2 ** 8 + uint8Array[i + 1];
  }
  return uint16Array;
}

/**
 * @param {number} number
 * @return {string}
 */
export function base64String(number) {
  return bytesToBase64(numberToUint8Array(number));
}

/**
 * @param {number} number
 * @return {string}
 */
export function hexString(number) {
  return bytesToHexString(numberToUint8Array(number));
}

/**
 * @param {number} number
 * @return {string}
 */
export function charCodeString(number) {
  return String.fromCodePoint(...numberToUint16Array(number));
}

/**
 * @param {number} number
 * @return {number}
 */
export function number(number) {
  return number;
}

/**
 * @param {number} number
 * @return {bigint}
 */
export function bigint(number) {
  return BigInt(number);
}

/**
 * @param {number} number
 * @return {number}
 */
export function exponentNumber(number) {
  return number / 2 ** 11;
}

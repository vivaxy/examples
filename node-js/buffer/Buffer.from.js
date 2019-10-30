/**
 * @since 2019-10-30 07:27
 * @author vivaxy
 */
const arr = new Uint8Array(2);

arr[0] = 0x12;
arr[1] = 0x34;

// Create buf
const buf1 = Buffer.from([0x12, 0x34]);
// Copy buf
const buf2 = Buffer.from(arr);
// Share buf
const buf3 = Buffer.from(arr.buffer);

console.log(buf1);
// Prints: <Buffer 12 34>
console.log(buf2);
// Prints: <Buffer 12 34>
console.log(buf3);
// Prints: <Buffer 12 34>

console.log(buf1.buffer);
// Prints: ArrayBuffer { [Uint8Contents]: <2f ..., byteLength: 8192 }
console.log(buf2.buffer);
// Prints: ArrayBuffer { [Uint8Contents]: <2f ..., byteLength: 8192 }
console.log(buf3.buffer);
// Prints: ArrayBuffer { [Uint8Contents]: <56 34>, byteLength: 2 }

console.log(buf1.equals(buf2), buf1.equals(buf3));

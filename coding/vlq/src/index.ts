const integerToChar =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
let charToInteger: { [char: string]: number } = {};

for (let i = 0; i < integerToChar.length; i++) {
  charToInteger[integerToChar[i]] = i;
}

export function encode(value: number | number[]): string {
  if (typeof value === 'number') {
    return encodeInteger(value);
  }
  let result = '';
  for (const v of value) {
    result += encodeInteger(v);
  }
  return result;
}

function encodeInteger(value: number): string {
  let result = '';
  const sign = value < 0 ? ((value = -value), 1) : 0;
  const bits = (value & 15) << 1;
  let continuation = (value >>= 4) === 0 ? 0 : 32;
  result += integerToChar[bits | continuation | sign];
  while (continuation !== 0) {
    const bits = value & 31;
    continuation = (value >>= 5) === 0 ? 0 : 32;
    result += integerToChar[bits | continuation];
  }
  return result;
}

export function decode() {}

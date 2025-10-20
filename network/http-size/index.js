function randomChineseChars(count = 10) {
  let result = '';
  for (let i = 0; i < count; i++) {
    // 汉字常用区：0x4e00 - 0x9fa5
    const code = Math.floor(Math.random() * (0x9fa5 - 0x4e00 + 1)) + 0x4e00;
    result += String.fromCharCode(code);
  }
  return result;
}

function randomSafeNumber(count = 10) {
  let results = [];
  for (let i = 0; i < count; i++) {
    const value =
      Math.random() * Number.MAX_SAFE_INTEGER * 0.9 +
      Number.MAX_SAFE_INTEGER * 0.1;
    results.push(value);
  }
  return results;
}

function randomJSON(count = 10) {
  let results = [];
  for (let i = 0; i < count; i++) {
    const value = {
      number: randomSafeNumber(80),
      string: randomChineseChars(80),
    };
    results.push(value);
  }
  return results;
}

const body = JSON.stringify(randomJSON(100));
const bodySize = new TextEncoder().encode(body).length;
console.log(bodySize);

const resp = await fetch('http://127.0.0.1:3000/test', {
  method: 'POST',
  body,
});
const res = await resp.json();
console.log(res);

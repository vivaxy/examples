/**
 * @since 20180918 19:22
 * @author vivaxy
 */

function compress(input) {
  const cset = {};
  for (let i = 0; i < 256; i++) {
    cset[String.fromCharCode(i)] = i;
  }
  if (input.length === 0) {
    return '';
  }
  let code = 256;
  let s = input[0];
  const output = [];
  for (let i = 1; i < input.length; i++) {
    const c = input[i];
    if (cset[s + c]) {
      s = s + c;
    } else {
      output.push(cset[s]);
      cset[s + c] = code;
      code++;
      s = c;
    }
  }
  output.push(cset[s]);
  return output;
}

function decompress(input) {
  const cset = {};
  for (let i = 0; i < 256; i++) {
    cset[i] = String.fromCharCode(i);
  }
  let code = 256;

  let current = input[0];
  let output = cset[input[0]];
  let previous = current;
  for (let i = 1; i < input.length; i++) {
    previous = current;
    current = input[i];
    if (cset[current]) {
      output += cset[current];
      cset[code] = cset[previous] + cset[current].charAt(0);
      code++;
    } else {
      const s = cset[previous] + cset[previous].charAt(0);
      output += s;
      cset[code] = s;
      code++
    }
  }
  return output;
}

exports.compress = compress;
exports.decompress = decompress;

module.exports = function filterSumUp(pxData, pxPos, byteWidth) {
  let sum = 0;
  const length = pxPos + byteWidth;
  for (let x = pxPos; x < length; x++) {
    const up = pxPos > 0 ? pxData[x - byteWidth] : 0;
    const val = pxData[x] - up;

    sum += Math.abs(val);
  }

  return sum;
};

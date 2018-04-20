module.exports = function filterSumNone(pxData, pxPos, byteWidth) {
  let sum = 0;
  const length = pxPos + byteWidth;
  for (let i = pxPos; i < length; i++) {
    sum += Math.abs(pxData[i]);
  }
  return sum;
};

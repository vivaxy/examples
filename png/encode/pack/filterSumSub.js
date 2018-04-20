module.exports = function filterSumSub(pxData, pxPos, byteWidth, bpp) {
  let sum = 0;
  for (let x = 0; x < byteWidth; x++) {
    const left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
    const val = pxData[pxPos + x] - left;
    sum += Math.abs(val);
  }

  return sum;
};

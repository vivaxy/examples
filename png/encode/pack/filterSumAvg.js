module.exports = function filterSumAvg(pxData, pxPos, byteWidth, bpp) {
  let sum = 0;
  for (let x = 0; x < byteWidth; x++) {

    const left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
    const up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
    const val = pxData[pxPos + x] - ((left + up) >> 1);

    sum += Math.abs(val);
  }

  return sum;
};

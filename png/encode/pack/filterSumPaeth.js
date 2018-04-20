const paethPredictor = require('../../lib/paeth-predictor.js');

module.exports = function filterSumPaeth(pxData, pxPos, byteWidth, bpp) {
  let sum = 0;
  for (let x = 0; x < byteWidth; x++) {
    const left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
    const up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
    const upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
    const val = pxData[pxPos + x] - paethPredictor(left, up, upleft);

    sum += Math.abs(val);
  }

  return sum;
};

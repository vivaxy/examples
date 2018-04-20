module.exports = function filterAvg(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
  for (let x = 0; x < byteWidth; x++) {
    const left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
    const up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
    rawData[rawPos + x] = pxData[pxPos + x] - ((left + up) >> 1);
  }
};

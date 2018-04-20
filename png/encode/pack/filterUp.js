module.exports = function filterUp(pxData, pxPos, byteWidth, rawData, rawPos) {
  for (let x = 0; x < byteWidth; x++) {
    const up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
    rawData[rawPos + x] = pxData[pxPos + x] - up;
  }
};

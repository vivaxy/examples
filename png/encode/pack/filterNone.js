module.exports = function filterNone(pxData, pxPos, byteWidth, rawData, rawPos) {
  for (var x = 0; x < byteWidth; x++) {
    rawData[rawPos + x] = pxData[pxPos + x];
  }
};

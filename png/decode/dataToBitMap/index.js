const interlaceUtils = require('../interlace.js');
const mapImage8Bit = require('./mapImage8Bit.js');
const mapImageCustomBit = require('./mapImageCustomBit.js');
const bitRetriever = require('./bitRetriever.js');

module.exports = function(data, bitmapInfo) {
  const {
    width,
    height,
    depth,
    bpp,
    interlace,
  } = bitmapInfo;
  let bits;

  if (depth !== 8) {
    bits = bitRetriever(data, depth);
  }
  let pxData;
  if (depth <= 8) {
    pxData = new Buffer(width * height * 4);
  } else {
    pxData = new Uint16Array(width * height * 4);
  }
  let rawPos = 0;
  let images;
  let getPxPos;

  if (interlace) {
    images = interlaceUtils.getImagePasses(width, height);
    getPxPos = interlaceUtils.getInterlaceIterator(width, height);
  } else {
    let nonInterlacedPxPos = 0;
    getPxPos = function() {
      const returner = nonInterlacedPxPos;
      nonInterlacedPxPos += 4;
      return returner;
    };
    images = [{ width: width, height: height }];
  }

  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    if (depth === 8) {
      rawPos = mapImage8Bit({
        image: images[imageIndex],
        pxData, getPxPos, bpp, data, rawPos,
      });
    } else {
      const maxBit = Math.pow(2, depth) - 1;
      rawPos = mapImageCustomBit({
        image: images[imageIndex],
        pxData, getPxPos, bpp, bits, maxBit,
      });
    }
  }
  if (depth === 8) {
    if (rawPos !== data.length) {
      throw new Error('extra data found');
    }
  } else {
    bits.end();
  }

  return pxData;
};

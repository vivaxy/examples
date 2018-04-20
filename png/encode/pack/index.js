const filterNone = require('./filterNone.js');
const filterSub = require('./filterSub.js');
const filterUp = require('./filterUp.js');
const filterAvg = require('./filterAvg.js');
const filterPaeth = require('./filterPaeth.js');
const filterSumNone = require('./filterSumNone.js');
const filterSumSub = require('./filterSumSub.js');
const filterSumUp = require('./filterSumUp.js');
const filterSumAvg = require('./filterSumAvg.js');
const filterSumPaeth = require('./filterSumPaeth.js');

const filters = {
  '0': filterNone,
  '1': filterSub,
  '2': filterUp,
  '3': filterAvg,
  '4': filterPaeth,
};

const filterSums = {
  '0': filterSumNone,
  '1': filterSumSub,
  '2': filterSumUp,
  '3': filterSumAvg,
  '4': filterSumPaeth,
};

module.exports = function(pxData, width, height, options, bpp) {
  let filterTypes;
  if (!('filterType' in options) || options.filterType === -1) {
    filterTypes = ['0', '1', '2', '3', '4'];
  } else if (typeof options.filterType === 'number') {
    filterTypes = [options.filterType];
  } else {
    throw new Error('unrecognised filter types');
  }

  if (options.bitDepth === 16) {
    bpp *= 2;
  }
  const byteWidth = width * bpp;
  let rawPos = 0;
  let pxPos = 0;
  const rawData = new Buffer((byteWidth + 1) * height);

  let sel = filterTypes[0];

  for (let y = 0; y < height; y++) {

    if (filterTypes.length > 1) {
      // find best filter for this line (with lowest sum of values)
      let min = Infinity;

      for (let i = 0; i < filterTypes.length; i++) {
        const sum = filterSums[filterTypes[i]](pxData, pxPos, byteWidth, bpp);
        if (sum < min) {
          sel = filterTypes[i];
          min = sum;
        }
      }
    }

    rawData[rawPos] = parseInt(sel, 10);
    rawPos++;
    filters[sel](pxData, pxPos, byteWidth, rawData, rawPos, bpp);
    rawPos += byteWidth;
    pxPos += byteWidth;
  }
  return rawData;
};

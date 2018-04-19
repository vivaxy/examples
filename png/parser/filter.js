/**
 * @since 20180419 15:17
 * @author vivaxy
 */

const SyncReader = require('./sync-reader.js');
const paethPredictor = require('./paeth-predictor.js');
const { getImagePasses } = require('./interlace.js');

function getByteWidth(width, bpp, depth) {
  let byteWidth = width * bpp;
  if (depth !== 8) {
    byteWidth = Math.ceil(byteWidth / (8 / depth));
  }
  return byteWidth;
}

module.exports = function filter(inBuffer, bitmapInfo) {

  const syncReader = new SyncReader(inBuffer);

  const images = [];

  if (bitmapInfo.interlace) {
    const passes = getImagePasses(bitmapInfo.width, bitmapInfo.height);
    for (let i = 0; i < passes.length; i++) {
      images.push({
        byteWidth: getByteWidth(passes[i].width, bitmapInfo.bpp, bitmapInfo.depth),
        height: passes[i].height,
        lineIndex: 0,
      });
    }
  } else {
    images.push({
      byteWidth: getByteWidth(bitmapInfo.width, bitmapInfo.bpp, bitmapInfo.depth),
      height: bitmapInfo.height,
      lineIndex: 0,
    });
  }

  let imageIndex = 0;
  const unfilteredLines = [];
  let lastLine = null;
  let xComparison = 1;
  if (bitmapInfo.depth === 8) {
    xComparison = bitmapInfo.bpp;
  } else if (bitmapInfo.depth === 16) {
    xComparison = bitmapInfo.bpp * 2;
  } else {
    xComparison = 1;
  }

  function read(length, callback) {
    syncReader.read(length, callback);
  }

  function unFilterType1(rawData, unfilteredLine, byteWidth) {
    const xBiggerThan = xComparison - 1;

    for (let x = 0; x < byteWidth; x++) {
      const rawByte = rawData[1 + x];
      const f1Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
      unfilteredLine[x] = rawByte + f1Left;
    }
  }

  function unFilterType2(rawData, unfilteredLine, byteWidth) {
    for (let x = 0; x < byteWidth; x++) {
      const rawByte = rawData[1 + x];
      const f2Up = lastLine ? lastLine[x] : 0;
      unfilteredLine[x] = rawByte + f2Up;
    }
  }

  function unFilterType3(rawData, unfilteredLine, byteWidth) {
    const xBiggerThan = xComparison - 1;
    for (let x = 0; x < byteWidth; x++) {
      const rawByte = rawData[1 + x];
      const f3Up = lastLine ? lastLine[x] : 0;
      const f3Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
      const f3Add = Math.floor((f3Left + f3Up) / 2);
      unfilteredLine[x] = rawByte + f3Add;
    }
  }

  function unFilterType4(rawData, unfilteredLine, byteWidth) {
    const xBiggerThan = xComparison - 1;

    for (let x = 0; x < byteWidth; x++) {
      const rawByte = rawData[1 + x];
      const f4Up = lastLine ? lastLine[x] : 0;
      const f4Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
      const f4UpLeft = x > xBiggerThan && lastLine ? lastLine[x - xComparison] : 0;
      const f4Add = paethPredictor(f4Left, f4Up, f4UpLeft);
      unfilteredLine[x] = rawByte + f4Add;
    }
  }

  function reverseFilterLine(rawData) {
    const filter = rawData[0];
    let unfilteredLine;
    let currentImage = images[imageIndex];
    const byteWidth = currentImage.byteWidth;

    if (filter === 0) {
      unfilteredLine = rawData.slice(1, byteWidth + 1);
    } else {

      unfilteredLine = new Buffer(byteWidth);

      switch (filter) {
        case 1:
          unFilterType1(rawData, unfilteredLine, byteWidth);
          break;
        case 2:
          unFilterType2(rawData, unfilteredLine, byteWidth);
          break;
        case 3:
          unFilterType3(rawData, unfilteredLine, byteWidth);
          break;
        case 4:
          unFilterType4(rawData, unfilteredLine, byteWidth);
          break;
        default:
          throw new Error('Unrecognised filter type - ' + filter);
      }
    }

    unfilteredLines.push(unfilteredLine);

    currentImage.lineIndex++;
    if (currentImage.lineIndex >= currentImage.height) {
      lastLine = null;
      imageIndex++;
      currentImage = images[imageIndex];
    } else {
      lastLine = unfilteredLine;
    }

    if (currentImage) {
      // read, using the byte width that may be from the new current image
      read(currentImage.byteWidth + 1, reverseFilterLine);
    } else {
      lastLine = null;
    }
  }

  function start() {
    read(images[imageIndex].byteWidth + 1, reverseFilterLine);
    syncReader.process();
    return Buffer.concat(unfilteredLines);
  }

  return start();

};

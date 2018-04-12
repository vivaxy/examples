/**
 * @since 20180412 16:20
 * @author vivaxy
 */

const { PNG } = require('pngjs3');
const fse = require('fs-extra');

const imageDataToBinary1 = async() => {
  // must be buffer
  const frameData = new Buffer([
    0xFF, 0x00, 0x00, 0x80,
    0x00, 0xFF, 0x00, 0x80,
    0x00, 0x00, 0xFF, 0x80,
    0xFF, 0x00, 0xFF, 0x80,
  ]);

  const buffer = PNG.sync.write({ data: frameData, width: 2, height: 2 }, { colorType: 6 });
  await fse.writeFile('imageDataToBinary1.png', buffer, { encoding: 'binary' });
};

imageDataToBinary1();

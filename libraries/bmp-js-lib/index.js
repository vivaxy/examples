/**
 * @since 20180412 17:20
 * @author vivaxy
 */

const fse = require('fs-extra');
const bmp = require('bmp-js');

const imageDataToBinary1 = async () => {
  const frameData = [
    0xff,
    0x00,
    0x00,
    0x80,
    0x00,
    0xff,
    0x00,
    0x80,
    0x00,
    0x00,
    0xff,
    0x80,
    0xff,
    0x00,
    0xff,
    0x00,
  ];
  const bmpImageData = bmp.encode(
    {
      width: 2,
      height: 2,
      data: frameData,
    },
    100,
  );
  console.log(bmpImageData);
  await fse.writeFile('imageDataToBinary1.jpg', bmpImageData.data, {
    encoding: 'binary',
  });
};

imageDataToBinary1();

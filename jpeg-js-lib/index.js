/**
 * @since 20180412 10:40
 * @author vivaxy
 */

const fse = require('fs-extra');
const jpeg = require('jpeg-js');
const Base64 = require('js-base64').Base64;

const imageDataToBinary1 = async() => {
  const frameData = new Uint8ClampedArray([
    0xFF, 0x00, 0x00, 0xFF,
    0x00, 0xFF, 0x00, 0xFF,
    0x00, 0x00, 0xFF, 0xFF,
    0xFF, 0x00, 0xFF, 0xFF,
  ]);

  const jpegImageData = jpeg.encode({
    width: 2,
    height: 2,
    data: frameData,
  }, 100);
  console.log(jpegImageData);
  await fse.writeFile('imageDataToBinary1.jpg', jpegImageData.data, { encoding: 'binary' });
};

const imageDataToBinary2 = async() => {
  // buffer only in nodejs
  const frameData = new Buffer([
    0xFF, 0x00, 0x00, 0xFF,
    0x00, 0xFF, 0x00, 0xFF,
    0x00, 0x00, 0xFF, 0xFF,
    0xFF, 0x00, 0xFF, 0xFF,
  ]);
  const jpegImageData = jpeg.encode({
    width: 2,
    height: 2,
    data: frameData,
  }, 100);
  console.log(jpegImageData);
  await fse.writeFile('imageDataToBinary2.jpg', jpegImageData.data, { encoding: 'binary' });
};

const imageDataToBinary3 = async() => {
  const frameData = [
    0xFF, 0x00, 0x00, 0xFF,
    0x00, 0xFF, 0x00, 0xFF,
    0x00, 0x00, 0xFF, 0xFF,
    0xFF, 0x00, 0xFF, 0xFF,
  ];
  const jpegImageData = jpeg.encode({
    width: 2,
    height: 2,
    data: frameData,
  }, 100);
  console.log(jpegImageData);
  await fse.writeFile('imageDataToBinary3.jpg', jpegImageData.data, { encoding: 'binary' });
};

const imageDataToBinary4 = async() => {
  const frameData = new Uint8Array([
    0xFF, 0x00, 0x00, 0xFF,
    0x00, 0xFF, 0x00, 0xFF,
    0x00, 0x00, 0xFF, 0xFF,
    0xFF, 0x00, 0xFF, 0xFF,
  ]);
  const jpegImageData = jpeg.encode({
    width: 2,
    height: 2,
    data: frameData,
  }, 100);
  console.log(jpegImageData);
  await fse.writeFile('imageDataToBinary4.jpg', jpegImageData.data, { encoding: 'binary' });
};

const imageDataToBase64 = async() => {
  const frameData = [
    0xFF, 0x00, 0x00, 0xFF,
    0x00, 0xFF, 0x00, 0xFF,
    0x00, 0x00, 0xFF, 0xFF,
    0xFF, 0x00, 0xFF, 0xFF,
  ];
  const jpegImageData = jpeg.encode({
    width: 2,
    height: 2,
    data: frameData,
  }, 100);
  const jpegDataUri = 'data:image/jpeg;base64,' + Base64.btoa(String.fromCharCode.apply(null, jpegImageData.data));
  console.log(jpegDataUri); // paste to browser to see the result
};

imageDataToBase64();

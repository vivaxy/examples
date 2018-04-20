/**
 * @since 20180419 16:17
 * @author vivaxy
 */

const parser = require('../../parser.js');

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

fetch('../fixtures/pixels_5x5_interlace.png')
  .then((res) => {
    return res.arrayBuffer();
  })
  .then((res) => {
    const { width, height, data } = parser(Buffer.from(res));
    canvas.width = width;
    canvas.style.width = width + 'px';
    canvas.height = height;
    canvas.style.height = height + 'px';
    const newData = new Uint8ClampedArray(data);
    const imageData = new ImageData(newData, width, height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  });

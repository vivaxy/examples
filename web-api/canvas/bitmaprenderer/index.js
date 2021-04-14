/**
 * @since 2019-08-03 22:01:28
 * @author vivaxy
 */

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.addEventListener('load', function () {
      resolve(image);
    });
    image.addEventListener('error', reject);
    image.src = src;
  });
}

(async function () {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('bitmaprenderer');
  const image = await loadImage('https://vivaxy.github.io/vivaxy.icon.png');
  const imageBitmap = await createImageBitmap(image);
  ctx.transferFromImageBitmap(imageBitmap);
})();

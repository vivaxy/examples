/**
 * @since 2019-10-28 12:43
 * @author vivaxy
 */
const canvas = document.getElementById('canvas');
const imageURL = '/vivaxy.icon.png';

document
  .getElementById('download-canvas-by-create-a-tag')
  .addEventListener('click', function() {
    const image = new Image();
    image.addEventListener('load', function() {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.setAttribute('href', dataURL);
      link.setAttribute('target', '_blank');
      link.setAttribute('download', 'download-canvas-by-create-a-tag.png');
      link.click();
    });
    image.src = imageURL;
  });

document
  .getElementById('download-canvas-by-redirect-to')
  .addEventListener('click', function() {
    const image = new Image();
    image.addEventListener('load', function() {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      window.location.href = dataURL.replace('image/png', 'image/octet-stream');
    });
    image.src = imageURL;
  });

/**
 * @since 20180530 16:32
 * @author vivaxy
 */

const video = document.querySelector('.handsome');
const canvas = document.querySelector('#paint');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');

async function go() {
  // first ask for get user media
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

function takePhoto() {
  console.log('Taking photo!');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  // link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  strip.insertBefore(link, strip.firstChild);
}

go().catch(err => {
  alert(err.message);
});

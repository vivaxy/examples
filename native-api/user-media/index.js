/**
 * @since 20180530 16:32
 * @author vivaxy
 */

const video = document.querySelector('.handsome');
const canvas = document.querySelector('#paint');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');

const getUserMediaOptions = { audio: true, video: { width: 1280, height: 720 } };

function takePhoto() {
  alert('Taking photo!');
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

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia(getUserMediaOptions)
    .then(handleStream)
    .catch(function(ex) {
      alert('navigator.mediaDevices.getUserMedia error' + ex.stack);
      legacyUserMedia();
    });
} else {
  legacyUserMedia();
}

function legacyUserMedia() {
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(getUserMediaOptions,
      handleStream,
      function(err) {
        alert('The following error occurred: ' + err.name);
      },
    );
  } else {
    alert('getUserMedia not supported');
  }
}

function handleStream(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = function(e) {
    video.play();
  };
}

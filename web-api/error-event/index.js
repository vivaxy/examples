function imageLoadError() {
  const image = new Image();
  image.src = 'https://127.0.0.1:6000/error.jpg';
}

function jsError() {
  const a = 1;
  a = 2;
}

imageLoadError();
jsError();

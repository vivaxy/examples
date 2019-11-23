// Model trained with https://teachablemachine.withgoogle.com/train/image
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = './model/';

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  labelContainer = document.getElementById('label-container');
  labelContainer.style.fontSize =
    Math.min(window.innerHeight, window.innerWidth) + 'px';
  labelContainer.style.lineHeight = window.innerHeight + 'px';

  const modelURL = URL + 'model.json';
  const metadataURL = URL + 'metadata.json';

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  const text =
    prediction[0].probability > prediction[1].probability ? '👈' : '👉';
  labelContainer.innerHTML = text;
}

init();

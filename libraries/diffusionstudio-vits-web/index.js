/**
 * @since 2024-07-18
 * @author vivaxy
 */
// import * as tts from
// 'https://unpkg.com/@diffusionstudio/vits-web/dist/vits-web.js?module';
// @ts-expect-error types
import * as tts from 'https://esm.run/@diffusionstudio/vits-web/dist/vits-web.js';

const playButton = document.getElementById('play');
const textarea = /** @type {HTMLTextAreaElement} */ (
  document.getElementById('textarea')
);
const voiceId = /** @type {HTMLSelectElement} */ (
  document.getElementById('voiceId')
);

function addVoiceIds() {
  Object.keys(tts.PATH_MAP).forEach((key) => {
    const option = document.createElement('option');
    option.text = key;
    option.value = key;
    voiceId.appendChild(option);
  });
  voiceId.value = 'en_US-hfc_female-medium';
}

// await tts.download('en_US-hfc_female-medium', (progress) => {
//   console.log(`Downloading ${progress.url} - ${Math.round(progress.loaded *
// 100 / progress.total)}%`); });

let wav = null;
let currentPromise = null;

async function predict() {
  playButton.setAttribute('disabled', '');
  const promise = tts.predict({
    text: textarea.value,
    voiceId: voiceId.value,
  });
  currentPromise = promise;
  wav = await currentPromise;
  if (currentPromise === promise) {
    playButton.removeAttribute('disabled');
    // } else {
    //   console.log('drop previous promise');
  }
}

textarea.addEventListener('change', predict);
voiceId.addEventListener('change', predict);
playButton.addEventListener('click', () => {
  const audio = new Audio();
  audio.src = URL.createObjectURL(wav);
  audio.play();
});

addVoiceIds();
predict();

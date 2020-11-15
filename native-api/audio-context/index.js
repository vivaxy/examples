/**
 * @since 2020-11-15 14:58
 * @author vivaxy
 */
import piano from './wave-tables/piano.js';

function play(frequency) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  const wave = audioContext.createPeriodicWave(piano.real, piano.imag);
  const oscillator = audioContext.createOscillator();
  oscillator.setPeriodicWave(wave);
  oscillator.frequency.value = frequency;
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(0.5);
}

document.body.addEventListener('click', function(e) {
  play(Number(e.target.dataset.frequency));
});

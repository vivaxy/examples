/**
 * @since 15-09-04 18:17
 * @author vivaxy
 */
'use strict';
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

if (navigator.getUserMedia) {
  navigator.getUserMedia(
    // constraints - only audio needed for this app
    {
      audio: true,
    },
    // Success callback
    function (stream) {
      var source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.connect(distortion);
      distortion.connect(biquadFilter);
      biquadFilter.connect(convolver);
      convolver.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      analyser.fftSize = 2048;
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      var draw = function () {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        console.log(dataArray);
      };
      draw();
    },
    // Error callback
    function (err) {
      console.log('The following getUserMedia error occurred: ' + err);
    },
  );
} else {
  console.log('getUserMedia not supported on your browser!');
}

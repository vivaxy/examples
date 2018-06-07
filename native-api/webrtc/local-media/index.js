const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
const stopButton = document.getElementById('stopButton');

callButton.disabled = true;
hangupButton.disabled = true;
stopButton.disabled = true;

startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);
stopButton.addEventListener('click', stop);

let startTime;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let remoteStream;
let pc1;
let pc2;

function start() {
  startButton.disabled = true;
  stopButton.disabled = false;

  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  })
    .then(gotStream)
    .catch(gotStreamError);
}

function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  stopButton.disabled = true;

  startTime = window.performance.now();

  pc1 = new RTCPeerConnection(null);
  pc1.addEventListener('icecandidate', onIceCandidate);

  pc2 = new RTCPeerConnection(null);
  pc1.addEventListener('icecandidate', onIceCandidate);
  pc2.addEventListener('addstream', onAddStream);

  pc1.addStream(localStream);

  pc1.createOffer().then(onCreateOfferSuccess).catch(onCreateOfferError);
}

function stop() {
  const localTracks = localStream.getVideoTracks();
  localTracks.forEach(function(localTrack) {
    localTrack.stop();
  });
  startButton.disabled = false;
  stopButton.disabled = true;
  callButton.disabled = true;
}

function gotStream(stream) {
  localVideo.srcObject = stream;
  localStream = stream;
  callButton.disabled = false;
}

function gotStreamError(err) {
  alert('getUserMedia() error: ' + err.message);
}

function onIceCandidate(e) {
  getOtherPc(e.target).addIceCandidate(e.candidate)
    .then(function() {
      onAddIceCandidateSuccess(e.target);
    })
    .catch(function(err) {
      onAddIceCandidateError(e.target, err);
    });
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function onAddIceCandidateSuccess(pc) {
  console.log('onAddIceCandidateSuccess', pc);
}

function onAddIceCandidateError(pc, error) {
  console.log('onAddIceCandidateError', pc, error);
}

function onAddStream(e) {
  const mediaStream = e.stream;
  remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
}

function onCreateOfferSuccess(desc) {
  pc1.setLocalDescription(desc).then(onSetLocalDescriptionSuccess).catch(onSetDescriptionError);
  pc2.setRemoteDescription(desc).then(onSetRemoteDescriptionSuccess).catch(onSetDescriptionError);
  pc2.createAnswer().then(onCreateAnswerSuccess).catch(onCreateAnswerError);
}

function onSetLocalDescriptionSuccess() {
  console.log('onSetLocalDescriptionSuccess');
}

function onSetDescriptionError(error) {
  console.log('onSetDescriptionError', error);
}

function onSetRemoteDescriptionSuccess() {
  console.log('onSetRemoteDescriptionSuccess');
}

function onCreateAnswerSuccess(desc) {
  pc2.setLocalDescription(desc).then(onSetLocalDescriptionSuccess).catch(onSetDescriptionError);
  pc1.setRemoteDescription(desc).then(onSetRemoteDescriptionSuccess).catch(onSetDescriptionError);
}

function onCreateAnswerError(error) {
  console.log('onCreateAnswerError', error);
}

function onCreateOfferError(error) {
  console.log('onCreateOfferError', error);
}

function hangup() {
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;

  hangupButton.disabled = true;
  callButton.disabled = false;
  stopButton.disabled = false;
}

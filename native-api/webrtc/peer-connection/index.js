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

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function gotStream(stream) {
  localVideo.srcObject = stream;
  localStream = stream;
  callButton.disabled = false;
}

function start() {
  startButton.disabled = true;
  stopButton.disabled = false;

  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
    .then(gotStream)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
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

  pc1.createOffer({}).then(
    onCreateOfferSuccess,
    onCreateSessionDescriptionError
  );
}

function onAddStream(e) {
  const mediaStream = e.stream;
  remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
}

function onCreateSessionDescriptionError(error) {
  console.log('onCreateSessionDescriptionError', error);
}

function onCreateOfferSuccess(desc) {
  pc1.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
  pc2.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(pc2);
    },
    onSetSessionDescriptionError
  );
  pc2.createAnswer().then(
    onCreateAnswerSuccess,
    onCreateSessionDescriptionError
  );
}

function onSetLocalSuccess(pc) {
  console.log('set local description success', pc);
}

function onSetRemoteSuccess(pc) {
  console.log('set remote description success', pc);
}

function onSetSessionDescriptionError(error) {
  console.log('set description error', error);
}

function onCreateAnswerSuccess(desc) {
  pc2.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc2);
    },
    onSetSessionDescriptionError
  );
  pc1.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
}

function onIceCandidate(e) {
  getOtherPc(e.target).addIceCandidate(e.candidate)
    .then(
      function() {
        onAddIceCandidateSuccess(e.target);
      },
      function(err) {
        onAddIceCandidateError(e.target, err);
      }
    );
}

function onAddIceCandidateSuccess(pc) {
  console.log('on add ice candidate success', pc);
}

function onAddIceCandidateError(pc, error) {
  console.log('on add ice candidate error', pc, error);
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

function stop() {
  const localTracks = localStream.getVideoTracks();
  localTracks.forEach(function(localTrack) {
    localTrack.stop();
  });
  startButton.disabled = false;
  stopButton.disabled = true;
  callButton.disabled = true;
}

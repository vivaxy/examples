/**
 * @since 20180607 19:30
 * @author vivaxy
 */

const dataChannelSend = document.getElementById('dataChannelSend');
const dataChannelReceive = document.getElementById('dataChannelReceive');
dataChannelSend.disabled = true;
dataChannelReceive.disabled = true;

const startButton = document.getElementById('startButton');
const sendButton = document.getElementById('sendButton');
const closeButton = document.getElementById('closeButton');
sendButton.disabled = true;
closeButton.disabled = true;

startButton.addEventListener('click', createConnection);
sendButton.addEventListener('click', sendData);
closeButton.addEventListener('click', closeConnection);

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

function createConnection() {
  dataChannelSend.placeholder = '';
  startButton.disabled = true;
  closeButton.disabled = false;

  const servers = null;
  const pcConstraint = null;
  const dataConstraint = null;

  trace('Creating local peer connection');
  localConnection = new RTCPeerConnection(servers, pcConstraint);
  localConnection.addEventListener('icecandidate', onLocalIceCandidate);

  trace('Creating send channel');
  sendChannel = localConnection.createDataChannel(
    'sendDataChannel',
    dataConstraint,
  );
  sendChannel.addEventListener('open', onSendChannelStateChange);
  sendChannel.addEventListener('close', onSendChannelStateChange);

  trace('Creating remote peer connection');
  remoteConnection = new RTCPeerConnection(servers, pcConstraint);
  remoteConnection.addEventListener('icecandidate', onRemoteIceCandidate);
  remoteConnection.addEventListener('datachannel', onDataChannel);

  trace('Sending local offer');
  localConnection
    .createOffer()
    .then(gotLocalDescription)
    .catch(onCreateLocalDescriptionError);
}

function sendData() {
  sendChannel.send(dataChannelSend.value);
  trace('Sent Data: ' + dataChannelSend.value);
}

function closeConnection() {
  trace('Closing data channels');
  sendChannel.close();
  trace('Closed data channel with label: ' + sendChannel.label);

  receiveChannel.close();
  trace('Closed data channel with label: ' + receiveChannel.label);

  localConnection.close();
  remoteConnection.close();

  localConnection = null;
  remoteConnection = null;

  trace('Closed peer connections');

  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
}

function trace(message) {
  console.log(
    (Math.floor(performance.now()) / 1000).toFixed(3) + ': ' + message,
  );
}

function onLocalIceCandidate(e) {
  if (e.candidate) {
    remoteConnection
      .addIceCandidate(e.candidate)
      .then(function () {
        onAddIceCandidateSuccess(localConnection);
      })
      .catch(function (err) {
        onAddIceCandidateError(localConnection, err);
      });
  }
}

function onAddIceCandidateSuccess(peerConnection) {
  if (peerConnection === localConnection) {
    trace('Local peer connection ice candidate success');
  } else {
    trace('Remote peer connection ice candidate success');
  }
}

function onAddIceCandidateError(peerConnection, err) {
  console.log('onAddIceCandidateError', peerConnection, err);
}

function onSendChannelStateChange(e) {
  if (e.type === 'open') {
    trace('Opened send channel');
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    trace('Closed send channel');
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onRemoteIceCandidate(e) {
  if (e.candidate) {
    localConnection
      .addIceCandidate(e.candidate)
      .then(function () {
        onAddIceCandidateSuccess(remoteConnection);
      })
      .catch(function (err) {
        onAddIceCandidateError(remoteConnection, err);
      });
  }
}

function onDataChannel(e) {
  receiveChannel = e.channel;
  receiveChannel.addEventListener('open', onReceiveChannelStateChange);
  receiveChannel.addEventListener('close', onReceiveChannelStateChange);
  receiveChannel.addEventListener('message', onReceiveChannelMessage);
}

function gotLocalDescription(desc) {
  trace('Sent local offer');
  localConnection
    .setLocalDescription(desc)
    .then(onSetLocalDescriptionSuccess)
    .catch(onSetLocalDescriptionError);
  remoteConnection
    .setRemoteDescription(desc)
    .then(onSetRemoteDescriptionSuccess)
    .catch(onSetRemoteDescriptionError);

  trace('Sending remote answer');
  remoteConnection
    .createAnswer()
    .then(onCreateAnswerSuccess, onCreateAnswerError);
}

function onSetLocalDescriptionSuccess() {
  trace('Set local description success');
}

function onSetLocalDescriptionError(err) {
  console.log('onSetLocalDescriptionError', err);
}

function onSetRemoteDescriptionSuccess() {
  trace('Set remote description success');
}

function onSetRemoteDescriptionError(err) {
  console.log('onSetRemoteDescriptionError', err);
}

function onCreateAnswerSuccess(desc) {
  trace('Sent remote answer');
  remoteConnection
    .setLocalDescription(desc)
    .then(onSetLocalDescriptionSuccess)
    .catch(onSetLocalDescriptionError);
  localConnection
    .setRemoteDescription(desc)
    .then(onSetRemoteDescriptionSuccess)
    .catch(onSetRemoteDescriptionError);
}

function onCreateAnswerError(err) {
  console.log('onCreateAnswerError', err);
}

function onCreateLocalDescriptionError(err) {
  console.log('onCreateLocalDescriptionError', err);
}

function onReceiveChannelStateChange(e) {
  trace('Receive channel is: ' + e.target.readyState);
}

function onReceiveChannelMessage(e) {
  trace('Received channel message: ' + e.data);
  dataChannelReceive.value = e.data;
}

var midi = null; // global MIDIAccess object

function onMIDISuccess(midiAccess) {
  console.log('MIDI ready!');
  midi = midiAccess;
  initPlay();
}

function onMIDIFailure(msg) {
  console.log('Failed to get MIDI access - ' + msg);
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

const pcList = [];

const pc = new RTCPeerConnection();

pc.onicecandidate = (event) => {
    if (event.candidate) {
        console.log('The ICE candidate (transport address: ' + event.candidate.candidate + ') has been added to this connection.');
        // Send the candidate to the remote peer
    } else {
        // All ICE candidates have been sent
    }
};

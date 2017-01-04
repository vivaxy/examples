/**
 * @since 2016-08-20 11:09
 * @author vivaxy
 */

var promisifiedOldGUM = function (constraints) {

    // First get ahold of getUserMedia, if present
    var getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia);

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
    });

};

if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
}

var constraints = {
    audio: true,
    video: {
        width: {
            min: 256,
            ideal: 1280,
            max: 1920
        },
        height: {
            min: 194,
            ideal: 720,
            max: 1080
        },
        facingMode: 'user'
    }
};

navigator.mediaDevices.getUserMedia(constraints)
    .then(function (mediaStream) {
        var video = document.querySelector('video');
        video.src = window.URL.createObjectURL(mediaStream);
        video.onloadedmetadata = function (e) {
            // Do something with the video here.
            video.play();
        };
    })
    .catch(function (err) {
        console.log(err.name);
    }); // always check for errors at the end.

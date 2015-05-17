/**
 * @since 150517 14:22
 * @author vivaxy
 */
var audio = document.querySelector('audio');

window.addEventListener('click', function () {
    audio.play();
}, false);

for (var i in audio) {
    if (audio.hasOwnProperty(i)) {
        console.log(i, audio[i]);
    }
}

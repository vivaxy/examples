/**
 * @since 2017-03-19 10:22:03
 * @author vivaxy
 * @see https://css-tricks.com/minecraft-webvr-html-using-frame/
 */

// Query scene graph using `querySelector`.
var sceneEl = document.querySelector('a-scene');
var boxEl = sceneEl.querySelector('a-box');

// Get data about entity with `getAttribute`.
console.log(boxEl.getAttribute('position'));
// >> {x: -1, y: 0.5, z: -3}

// Add event listener with `addEventListener`.
boxEl.addEventListener('click', function () {
  // Modify entity with `setAttribute`.
  boxEl.setAttribute('color', 'red');
});

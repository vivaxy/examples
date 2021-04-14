/**
 * @since 2017-03-19 11:27:38
 * @author vivaxy
 */

AFRAME.registerComponent('random-color', {
  dependencies: ['material'],
  init: function () {
    this.el.setAttribute('material', 'color', getRandomColor());
  },
});

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
